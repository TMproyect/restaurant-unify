
/**
 * Utility functions for image conversion
 */

/**
 * Convierte una imagen File a Base64 (fallback)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se proporcionó archivo"));
      return;
    }
    
    // Validaciones básicas
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("La imagen no debe superar los 5MB"));
      return;
    }

    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      reject(new Error("Formato de imagen inválido. Use JPG, PNG, GIF o WebP"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte una imagen Base64 a un objeto Blob/File para subir a Storage
 */
export const base64ToFile = (base64Image: string): { blob: Blob; mimeType: string; fileExt: string } => {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    throw new Error("Formato de imagen Base64 inválido");
  }

  const mimeType = base64Image.split(';')[0].split(':')[1];
  const byteString = atob(base64Image.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const fileExt = mimeType.split('/')[1];
  
  return { blob, mimeType, fileExt };
};
