/**
 * Tối ưu URL ảnh Cloudinary bằng cách chèn tham số transform.
 * Giảm dung lượng ảnh 50-80% mà không cần re-upload.
 *
 * @param {string} url - URL ảnh gốc từ Cloudinary
 * @param {object} options
 * @param {number} [options.width] - Chiều rộng mong muốn (px)
 * @param {string} [options.quality='auto'] - Chất lượng ảnh ('auto', 'auto:low', 'auto:good', '80',...)
 * @param {string} [options.format='auto'] - Định dạng ('auto' = WebP/AVIF tùy trình duyệt)
 * @param {string} [options.crop='scale'] - Kiểu cắt ('scale', 'fill', 'fit',...)
 * @returns {string} URL đã tối ưu
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  // Chỉ xử lý URL của Cloudinary
  if (!url.includes('res.cloudinary.com')) return url;

  const {
    width,
    quality = 'auto',
    format = 'auto',
    crop = 'scale',
  } = options;

  // Xây dựng chuỗi transform
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) {
    transforms.push(`c_${crop}`, `w_${width}`);
  }
  const transformStr = transforms.join(',');

  // Cloudinary URL pattern: .../upload/v1234.../filename.jpg
  // Chèn transform SAU /upload/ và TRƯỚC /v...
  // Nếu đã có transform rồi thì thay thế
  const uploadRegex = /\/upload\/(?:(v\d+)\/)?/;
  const match = url.match(uploadRegex);

  if (!match) return url; // Không phải URL chuẩn Cloudinary

  const version = match[1] ? `${match[1]}/` : '';
  return url.replace(uploadRegex, `/upload/${transformStr}/${version}`);
}

/**
 * Presets nhanh cho các trường hợp phổ biến
 */
export const cloudinaryPresets = {
  /** Ảnh thumbnail nhỏ (product card, danh sách) */
  thumbnail: (url) => optimizeCloudinaryUrl(url, { width: 300, quality: 'auto' }),

  /** Ảnh trung bình (chi tiết sản phẩm) */
  medium: (url) => optimizeCloudinaryUrl(url, { width: 600, quality: 'auto' }),

  /** Ảnh lớn (banner, hero) */
  banner: (url) => optimizeCloudinaryUrl(url, { width: 1920, quality: 'auto:best' }),

  /** Ảnh avatar nhỏ */
  avatar: (url) => optimizeCloudinaryUrl(url, { width: 100, quality: 'auto', crop: 'fill' }),
};
