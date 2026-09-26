import Tar from 'tar-js';
import { gzipSync } from 'fflate';
import { Toastify } from './toasts';

export const compressFile = async (file: File): Promise<Blob> => {
  const tar = new Tar();
  
  try {
    const arrayBuffer = await file.arrayBuffer();

    tar.append(file.name, new Uint8Array(arrayBuffer));

    const tarData = tar.out;

    const gzipped = gzipSync(tarData);
    return new Blob([gzipped], { type: 'application/gzip' });
  } catch (error) {
    Toastify({ type: 'error', message: String(error) })
    return new Blob();
  }
};
