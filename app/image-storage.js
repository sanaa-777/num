// =============================================
// Image Upload Service - GitHub Storage
// Completely free, no payment required
// Uses GitHub repo as image storage + CDN
// =============================================

const ImageStorage = {
  // GitHub config
  REPO: 'sanaa-777/num',
  BRANCH: 'main',
  IMAGE_DIR: 'images',
  MAX_SIZE: 800,      // max dimension
  QUALITY: 0.80,      // JPEG quality
  MAX_FILE_SIZE: 500000, // 500KB after compression

  // Get GitHub token from sessionStorage (set during admin login)
  _getToken() {
    return sessionStorage.getItem('dy_gh_token') || '';
  },

  _setToken(token) {
    sessionStorage.setItem('dy_gh_token', token);
  },

  // Compress image for upload
  compress(file, maxWidth) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          if (h > maxWidth) { w = (maxWidth / h) * w; h = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          
          // Try different quality levels to meet size limit
          let quality = this.QUALITY;
          let blob;
          do {
            blob = dataURLtoBlob(canvas.toDataURL('image/jpeg', quality));
            quality -= 0.1;
          } while (blob.size > this.MAX_FILE_SIZE && quality > 0.3);
          
          resolve(blob);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Upload image to GitHub repo (accepts File or Blob)
  async upload(file, folder) {
    // Compress if it's a File, use directly if it's already a compressed Blob
    let blob;
    if (file instanceof Blob && !(file instanceof File)) {
      blob = file; // Already compressed
    } else {
      blob = await this.compress(file, this.MAX_SIZE);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const ext = 'jpg';
    const filename = `${folder}/${timestamp}_${random}.${ext}`;
    const path = `${this.IMAGE_DIR}/${filename}`;

    // Convert blob to base64
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    // Upload to GitHub
    const token = this._getToken();
    if (!token) {
      throw new Error('GitHub token not set. Admin must configure image storage.');
    }

    const response = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64,
        branch: this.BRANCH,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Upload failed: ${error.message || response.status}`);
    }

    const result = await response.json();
    
    // Return the raw URL for display
    const rawUrl = `https://raw.githubusercontent.com/${this.REPO}/${this.BRANCH}/${path}`;
    return {
      url: rawUrl,
      path: path,
      sha: result.content.sha,
      size: blob.size,
    };
  },

  // Delete image from GitHub
  async delete(path, sha) {
    const token = this._getToken();
    if (!token || !sha) return false;

    const response = await fetch(`https://api.github.com/repos/${this.REPO}/contents/${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete image: ${path}`,
        sha: sha,
        branch: this.BRANCH,
      }),
    });

    return response.ok;
  },

  // Replace image (delete old + upload new)
  async replace(file, folder, oldPath, oldSha) {
    // Delete old image if exists
    if (oldPath && oldSha) {
      await this.delete(oldPath, oldSha).catch(() => {});
    }
    // Upload new image
    return await this.upload(file, folder);
  },

  // Set GitHub token (called from admin panel)
  configure(token) {
    this._setToken(token);
    return true;
  },

  // Check if configured
  isConfigured() {
    return !!this._getToken();
  },

  // Test connection
  async testConnection() {
    const token = this._getToken();
    if (!token) return { ok: false, error: 'No token configured' };

    try {
      const response = await fetch(`https://api.github.com/repos/${this.REPO}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      if (response.ok) {
        return { ok: true, repo: this.REPO };
      }
      return { ok: false, error: `HTTP ${response.status}` };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
};

// Helper: Convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
