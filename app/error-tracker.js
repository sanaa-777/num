// =============================================
// Error Tracker - نظام احترافي لتتبع الأخطاء
// =============================================

(function () {
  const ErrorTracker = {
    db: null,
    firebase: null,
    isDevelopment: /(^localhost$)|(^127\.0\.0\.1$)/.test(location.hostname) || location.search.includes('debugErrors=1'),
    collectionName: 'error_logs',
    pendingStorageKey: 'dy_pending_error_logs',
    counterStorageKey: 'dy_error_counter',
    consolePatched: false,
    _isCapturingFromConsole: false,

    init() {
      this.patchConsoleError();
      this.installGlobalHandlers();
      this.flushPendingLogs();
      return this;
    },

    attachFirestore(dbInstance, firebaseInstance) {
      this.db = dbInstance || null;
      this.firebase = firebaseInstance || null;
      this.flushPendingLogs();
      return this;
    },

    getCurrentPage() {
      try {
        return location.pathname + location.hash;
      } catch (_) {
        return 'unknown';
      }
    },

    getTimestampParts(date = new Date()) {
      const iso = date.toISOString();
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      const hh = String(date.getUTCHours()).padStart(2, '0');
      const mm = String(date.getUTCMinutes()).padStart(2, '0');
      const ss = String(date.getUTCSeconds()).padStart(2, '0');
      return {
        iso,
        date: `${y}${m}${d}`,
        pretty: `${y}-${m}-${d} ${hh}:${mm}:${ss} UTC`
      };
    },

    nextErrorId() {
      const parts = this.getTimestampParts();
      let counterState = {};
      try {
        counterState = JSON.parse(localStorage.getItem(this.counterStorageKey) || '{}') || {};
      } catch (_) {}

      if (counterState.date !== parts.date) {
        counterState = { date: parts.date, count: 0 };
      }

      counterState.count = Number(counterState.count || 0) + 1;
      try {
        localStorage.setItem(this.counterStorageKey, JSON.stringify(counterState));
      } catch (_) {}

      return `ERR-${parts.date}-${String(counterState.count).padStart(3, '0')}`;
    },

    safeClone(value, depth = 0) {
      if (value == null) return value;
      if (depth > 4) return '[MaxDepth]';
      if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          code: value.code || null,
          stack: value.stack || null
        };
      }
      if (value instanceof Event) {
        return {
          type: value.type,
          target: value.target && value.target.tagName ? value.target.tagName : null,
          currentTarget: value.currentTarget && value.currentTarget.tagName ? value.currentTarget.tagName : null
        };
      }
      if (Array.isArray(value)) return value.slice(0, 20).map(item => this.safeClone(item, depth + 1));
      if (typeof value === 'object') {
        const out = {};
        Object.keys(value).slice(0, 30).forEach((key) => {
          try {
            out[key] = this.safeClone(value[key], depth + 1);
          } catch (_) {
            out[key] = '[Unreadable]';
          }
        });
        return out;
      }
      return value;
    },

    extractFileLine(error) {
      const stack = (error && error.stack) || '';
      const patterns = [
        /https?:\/\/[^\s)]+\/(.+?):(\d+):(\d+)/,
        /\((.+?):(\d+):(\d+)\)/,
        /at (.+?):(\d+):(\d+)/
      ];
      for (const pattern of patterns) {
        const match = stack.match(pattern);
        if (match) {
          return {
            file: match[1],
            line: Number(match[2]),
            column: Number(match[3])
          };
        }
      }
      return {
        file: error && error.fileName ? error.fileName : null,
        line: error && error.lineNumber ? Number(error.lineNumber) : null,
        column: error && error.columnNumber ? Number(error.columnNumber) : null
      };
    },

    mapFriendlyMessage(code, fallbackMessage) {
      const messages = {
        'auth/email-already-in-use': 'البريد الإلكتروني مسجل مسبقاً',
        'auth/invalid-email': 'بريد إلكتروني غير صالح',
        'auth/operation-not-allowed': 'العملية غير مسموحة حالياً',
        'auth/weak-password': 'كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل',
        'auth/user-disabled': 'تم تعطيل هذا الحساب',
        'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/too-many-requests': 'عدد المحاولات كبير، حاول لاحقاً',
        'auth/network-request-failed': 'تعذر الاتصال بالشبكة',
        'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول قبل الإكمال',
        'auth/popup-blocked': 'تم حظر النافذة المنبثقة الخاصة بتسجيل الدخول',
        'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
        'firestore/permission-denied': 'لا توجد صلاحية كافية لتنفيذ هذه العملية',
        'firestore/unavailable': 'الخدمة غير متاحة حالياً، حاول مرة أخرى بعد قليل',
        'storage/unauthorized': 'لا توجد صلاحية للوصول إلى الملف المطلوب',
        'storage/canceled': 'تم إلغاء عملية الرفع',
        'storage/unknown': 'حدثت مشكلة أثناء معالجة الملف'
      };
      return messages[code] || fallbackMessage || 'تعذر إكمال العملية حالياً';
    },

    normalize(error, meta = {}) {
      const now = new Date();
      const parts = this.getTimestampParts(now);
      const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : (error && error.message) || 'Unexpected failure');
      const fileInfo = this.extractFileLine(err);
      const code = meta.code || err.code || 'APP-UNEXPECTED';
      const name = err.name || meta.name || 'Error';
      const message = err.message || meta.message || 'Unexpected failure';
      const userMessage = meta.userMessage || this.mapFriendlyMessage(code, message);
      const errorId = meta.errorId || this.nextErrorId();
      const page = meta.page || this.getCurrentPage();
      const operation = meta.operation || 'unknown_operation';

      return {
        errorId,
        errorName: name,
        errorCode: code,
        message,
        userMessage,
        occurredAt: parts.iso,
        occurredAtLabel: parts.pretty,
        page,
        operation,
        environment: this.isDevelopment ? 'development' : 'production',
        stack: err.stack || null,
        cause: err.cause ? this.safeClone(err.cause) : null,
        file: meta.file || fileInfo.file,
        line: meta.line || fileInfo.line,
        column: meta.column || fileInfo.column,
        request: this.safeClone(meta.request || null),
        requestData: this.safeClone(meta.requestData || meta.payload || null),
        context: this.safeClone(meta.context || null),
        route: location.hash || '#',
        url: location.href,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        source: meta.source || 'application'
      };
    },

    persistPending(payload) {
      try {
        const logs = JSON.parse(localStorage.getItem(this.pendingStorageKey) || '[]');
        logs.push(payload);
        localStorage.setItem(this.pendingStorageKey, JSON.stringify(logs.slice(-50)));
      } catch (_) {}
    },

    async writeLog(payload) {
      if (!this.db || !this.firebase) {
        this.persistPending(payload);
        return false;
      }

      try {
        const doc = {
          ...payload,
          clientOccurredAt: payload.occurredAt,
          createdAt: this.firebase.firestore.FieldValue.serverTimestamp()
        };
        await this.db.collection(this.collectionName).doc(payload.errorId).set(doc, { merge: true });
        return true;
      } catch (writeError) {
        this.persistPending(payload);
        return false;
      }
    },

    async flushPendingLogs() {
      if (!this.db || !this.firebase) return;
      let logs = [];
      try {
        logs = JSON.parse(localStorage.getItem(this.pendingStorageKey) || '[]');
      } catch (_) {}
      if (!Array.isArray(logs) || !logs.length) return;

      const remaining = [];
      for (const log of logs) {
        try {
          await this.writeLog(log);
        } catch (_) {
          remaining.push(log);
        }
      }
      try {
        if (remaining.length) {
          localStorage.setItem(this.pendingStorageKey, JSON.stringify(remaining.slice(-50)));
        } else {
          localStorage.removeItem(this.pendingStorageKey);
        }
      } catch (_) {}
    },

    async capture(error, meta = {}) {
      const payload = this.normalize(error, meta);
      try {
        const originalConsole = this._originalConsoleError || console.error.bind(console);
        originalConsole('[ErrorTracker]', payload.errorId, payload.errorCode, payload.errorName, payload.message, payload);
      } catch (_) {}
      await this.writeLog(payload);
      return payload;
    },

    createUserError(error, meta = {}) {
      const payload = this.normalize(error, meta);
      this.writeLog(payload);
      const wrapped = new Error(meta.userMessage || payload.userMessage);
      wrapped.name = payload.errorName;
      wrapped.code = payload.errorCode;
      wrapped.errorId = payload.errorId;
      wrapped.display = payload;
      wrapped.originalMessage = payload.message;
      wrapped.stack = error && error.stack ? error.stack : wrapped.stack;
      wrapped.message = this.getInlineMessage(wrapped);
      return wrapped;
    },

    getInlineMessage(error) {
      const payload = error && error.display ? error.display : this.normalize(error || new Error('Unexpected failure'));
      return `${payload.userMessage} — ${payload.errorName} | ${payload.errorCode} | ${payload.errorId} | ${payload.occurredAtLabel} | ${payload.operation}`;
    },

    buildErrorCard(payload, options = {}) {
      const title = options.title || 'حدث خطأ ويمكن تتبعه';
      const message = options.message || payload.userMessage || 'تعذر إكمال العملية حالياً';
      const actionLabel = options.actionLabel || 'إعادة المحاولة';
      const action = options.action || 'location.reload()';
      const extraDevBlock = this.isDevelopment ? `
        <details style="margin-top:16px;text-align:right;background:#0f172a;color:#e2e8f0;border-radius:12px;padding:12px 14px;">
          <summary style="cursor:pointer;font-weight:700;">تفاصيل التطوير</summary>
          <div style="margin-top:10px;font-size:12px;line-height:1.8;white-space:pre-wrap;direction:ltr;text-align:left;">${this.escapeHtml(payload.stack || payload.message || 'No stack trace')}</div>
        </details>` : '';

      return `
      <div style="min-height:${options.minHeight || '70vh'};display:flex;align-items:center;justify-content:center;padding:24px;background:${options.background || 'linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)'};">
        <div style="width:min(100%,760px);background:#fff;border:1px solid #dbeafe;border-radius:20px;box-shadow:0 20px 60px rgba(15,23,42,.12);padding:24px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
            <div style="width:56px;height:56px;border-radius:16px;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;">!</div>
            <div>
              <h2 style="margin:0 0 6px;font-size:22px;color:#0f172a;">${this.escapeHtml(title)}</h2>
              <p style="margin:0;color:#475569;font-size:14px;">${this.escapeHtml(message)}</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
            ${this.infoBox('اسم الخطأ', payload.errorName)}
            ${this.infoBox('رمز الخطأ', payload.errorCode)}
            ${this.infoBox('معرف الخطأ', payload.errorId)}
            ${this.infoBox('وقت الحدوث', payload.occurredAtLabel)}
            ${this.infoBox('الصفحة', payload.page)}
            ${this.infoBox('العملية', payload.operation)}
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
            <button onclick="${action}" style="background:#2563eb;color:#fff;border:none;border-radius:12px;padding:12px 18px;font-weight:700;cursor:pointer;">${this.escapeHtml(actionLabel)}</button>
            <button onclick="navigator.clipboard && navigator.clipboard.writeText('${payload.errorId}').then(() => alert('تم نسخ معرف الخطأ: ${payload.errorId}'))" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:12px;padding:12px 18px;font-weight:700;cursor:pointer;">نسخ معرف الخطأ</button>
          </div>
          ${extraDevBlock}
        </div>
      </div>`;
    },

    infoBox(label, value) {
      return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px;"><div style="font-size:12px;color:#64748b;margin-bottom:4px;">${this.escapeHtml(label)}</div><div style="font-size:14px;color:#0f172a;font-weight:700;word-break:break-word;">${this.escapeHtml(value || '-')}</div></div>`;
    },

    renderErrorCard(target, error, options = {}) {
      const payload = error && error.display ? error.display : this.normalize(error, options.meta || {});
      const element = typeof target === 'string' ? document.getElementById(target) : target;
      if (!element) return payload;
      element.innerHTML = this.buildErrorCard(payload, options);
      return payload;
    },

    patchConsoleError() {
      if (this.consolePatched) return;
      this.consolePatched = true;
      this._originalConsoleError = console.error.bind(console);
      const tracker = this;
      console.error = function patchedConsoleError(...args) {
        tracker._originalConsoleError(...args);
        if (tracker._isCapturingFromConsole) return;
        try {
          const candidate = args.find(arg => arg instanceof Error || (arg && typeof arg === 'object' && (arg.message || arg.code || arg.stack)));
          if (!candidate) return;
          tracker._isCapturingFromConsole = true;
          tracker.capture(candidate instanceof Error ? candidate : new Error(candidate.message || 'Console error'), {
            operation: 'console.error',
            source: 'console',
            context: { args: tracker.safeClone(args) }
          }).finally(() => {
            tracker._isCapturingFromConsole = false;
          });
        } catch (_) {
          tracker._isCapturingFromConsole = false;
        }
      };
    },

    installGlobalHandlers() {
      if (this._handlersInstalled) return;
      this._handlersInstalled = true;

      window.addEventListener('error', (event) => {
        const err = event.error || new Error(event.message || 'Unhandled error');
        this.capture(err, {
          operation: 'window.error',
          source: 'global_error_handler',
          page: this.getCurrentPage(),
          file: event.filename || null,
          line: event.lineno || null,
          column: event.colno || null,
          context: {
            message: event.message,
            type: event.type
          }
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : 'Unhandled promise rejection');
        this.capture(err, {
          operation: 'window.unhandledrejection',
          source: 'global_promise_handler',
          context: this.safeClone(reason)
        });
      });
    },

    escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  window.ErrorTracker = ErrorTracker.init();
})();
