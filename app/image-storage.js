// =============================================
// Image Upload Service — Cloudinary (Free Tier)
// =============================================
// Completely free, no backend, no payment card.
// Uses Cloudinary unsigned upload presets — no API secrets in frontend.
// Free tier: 25 GB storage, 25 GB bandwidth/month, auto CDN + optimization.
//
// SETUP (one-time, by admin):
//   1. Create free account at https://cloudinary.com
//   2. Go to Settings → Upload → Upload presets
//   3. Add unsigned upload preset (name it e.g. "dalil_unsigned")
//   4. Set folder to "dalil-yemen" in the preset settings
//   5. Enter cloud name + preset name in the admin panel sidebar
// =============================================

const ImageStorage = {
  // Cloudinary config — defaults hardcoded (safe to expose: unsigned preset)
  // Admin can override via localStorage if needed
  _DEFAULT_CLOUD: 'unsin9eb',
  _DEFAULT_PRESET: 'dalil_unsigned',
  _cloudName: localStorage.getItem('dy_cloud_name') || 'unsin9eb',
  _uploadPreset: localStorage.getItem('dy_upload_preset') || 'dalil_unsigned',

  // Compression settings
  MAX_DIMENSION: 1200,
  QUALITY: 0.82,
  MAX_FILE_SIZE: 900000,  // 900 KB after compression (Cloudinary free: 10 MB upload limit)

  // ====== Configuration ======
  configure(cloudName, uploadPreset) {
    this._cloudName = cloudName.trim();
    this._uploadPreset = uploadPreset.trim();
    localStorage.setItem('dy_cloud_name', this._cloudName);
    localStorage.setItem('dy_upload_preset', this._uploadPreset);
  },

  isConfigured() {
    return !!(this._cloudName && this._uploadPreset);
  },

  async testConnection() {
    if (!this.isConfigured()) {
      return { ok: false, error: 'الرجاء إدخال Cloud Name و Upload Preset' };
    }
    try {
      // Test using the same unsigned upload endpoint as real uploads.
      // Upload a tiny 1x1 transparent PNG to verify credentials work.
      var TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg==';
      var blob = this._dataURLtoBlob(TINY_PNG);
      var formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', this._uploadPreset);
      formData.append('folder', 'dalil-yemen/_test');
      formData.append('public_id', 'conn_test_' + Date.now());

      var resp = await fetch(
        'https://api.cloudinary.com/v1_1/' + this._cloudName + '/image/upload',
        { method: 'POST', body: formData }
      );

      if (resp.ok) {
        var result = await resp.json();
        return { ok: true, cloud: this._cloudName, testUrl: result.secure_url };
      }
      var err = await resp.json().catch(function () { return {}; });
      return { ok: false, error: err.error?.message || 'HTTP ' + resp.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  },

  // ====== Image Compression ======
  compress(file, maxWidth) {
    maxWidth = maxWidth || this.MAX_DIMENSION;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          if (h > maxWidth) { w = (maxWidth / h) * w; h = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          // Try decreasing quality until under size limit
          var quality = ImageStorage.QUALITY;
          var blob;
          do {
            blob = ImageStorage._dataURLtoBlob(canvas.toDataURL('image/jpeg', quality));
            quality -= 0.08;
          } while (blob.size > ImageStorage.MAX_FILE_SIZE && quality > 0.25);

          resolve(blob);
        };
        img.onerror = function () { reject(new Error('فشل تحميل الصورة')); };
        img.src = e.target.result;
      };
      reader.onerror = function () { reject(new Error('فشل قراءة الملف')); };
      reader.readAsDataURL(file);
    });
  },

  // ====== Upload to Cloudinary ======
  async upload(file, folder) {
    if (!this.isConfigured()) {
      throw new Error('رفع الصور غير مُعدّل. يرجى تكوين Cloudinary من إعدادات لوحة التحكم.');
    }

    // Compress
    var blob;
    if (file instanceof Blob && !(file instanceof File)) {
      blob = file; // already compressed
    } else {
      blob = await this.compress(file);
    }

    // Build form data
    var formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', this._uploadPreset);
    formData.append('folder', folder || 'dalil-yemen/uploads');

    // Unique public_id
    var timestamp = Date.now();
    var random = Math.random().toString(36).slice(2, 8);
    formData.append('public_id', timestamp + '_' + random);

    // Upload
    var response = await fetch(
      'https://api.cloudinary.com/v1_1/' + this._cloudName + '/image/upload',
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      var err = await response.json().catch(function () { return {}; });
      throw new Error(err.error?.message || 'Upload failed: HTTP ' + response.status);
    }

    var result = await response.json();

    // Return optimized URL (auto format + quality)
    var optimizedUrl = result.secure_url.replace(
      '/upload/',
      '/upload/f_auto,q_auto/'
    );

    return {
      url: optimizedUrl,
      publicId: result.public_id,
      size: blob.size,
      width: result.width,
      height: result.height
    };
  },

  // ====== Delete from Cloudinary ======
  // Note: Unsigned uploads cannot be deleted via API without authentication.
  // For admin cleanup, use the Cloudinary dashboard.
  // This method is a no-op for unsigned presets.
  async delete(publicId) {
    console.warn('ImageStorage.delete: unsigned presets cannot delete via API. Use Cloudinary dashboard for cleanup.');
    return false;
  },

  // ====== Replace image ======
  async replace(file, folder, _oldPublicId) {
    // Upload new image (old one stays in Cloudinary — dashboard cleanup)
    return await this.upload(file, folder);
  },

  // ====== Clear configuration ======
  clearConfig() {
    this._cloudName = '';
    this._uploadPreset = '';
    localStorage.removeItem('dy_cloud_name');
    localStorage.removeItem('dy_upload_preset');
  },

  // ====== Get current config (for UI display) ======
  getConfig() {
    return {
      cloudName: this._cloudName,
      uploadPreset: this._uploadPreset,
      configured: this.isConfigured()
    };
  },

  // ====== Helpers ======
  _dataURLtoBlob: function (dataURL) {
    var parts = dataURL.split(',');
    var mime = parts[0].match(/:(.*?);/)[1];
    var binary = atob(parts[1]);
    var array = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  }
};
