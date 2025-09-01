// Test utility for image upload functionality
export const createTestImageFile = (name: string, sizeKB: number = 100): File => {
  // Create a simple canvas with test content
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Fill with a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#ff7a6b');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Image', 100, 100);
    ctx.fillText(name, 100, 130);
  }
  
  // Convert canvas to blob then to file
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], name, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        resolve(file);
      }
    }, 'image/png');
  }) as any; // Type assertion for immediate return
};

export const testFileUpload = async (files: File[]): Promise<string[]> => {
  const results: string[] = [];
  
  for (const file of files) {
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      console.log(`Test: Successfully converted ${file.name} to base64`);
      results.push(base64);
    } catch (error) {
      console.error(`Test: Failed to process ${file.name}:`, error);
      throw error;
    }
  }
  
  return results;
};

// Create test files for development
export const createTestFiles = (): Promise<File[]> => {
  return Promise.all([
    createTestImageFile('test-photo-1.png'),
    createTestImageFile('test-photo-2.png'),
    createTestImageFile('test-photo-3.png')
  ]);
};