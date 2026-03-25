import html2canvas from 'html2canvas';

export async function captureNode(node, fileName = 'spin-result.png') {
  const canvas = await html2canvas(node, {
    backgroundColor: '#030712',
    scale: 2,
    useCORS: true
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  return { canvas, dataUrl };
}

export async function shareCapture(node, fileName = 'spin-result.png') {
  const canvas = await html2canvas(node, {
    backgroundColor: '#030712',
    scale: 2,
    useCORS: true
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Unable to prepare screenshot'));
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Spin Result' });
        resolve(true);
      } else {
        reject(new Error('Web share not supported on this device'));
      }
    }, 'image/png');
  });
}
