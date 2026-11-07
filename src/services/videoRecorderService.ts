/**
 * Video Recording & Export Service
 * Captures HTML5 canvas or screen stream to generate downloadable WebM/MP4 video files.
 */

export class VideoRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  public async startRecording(elementOrCanvas: HTMLElement): Promise<boolean> {
    this.recordedChunks = [];

    try {
      let stream: MediaStream | null = null;

      // If it's a canvas element
      if (elementOrCanvas instanceof HTMLCanvasElement) {
        stream = elementOrCanvas.captureStream(30);
      } else if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Option to capture tab/display directly
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'browser',
          },
          audio: true,
        });
      }

      if (!stream) {
        return false;
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.downloadVideo();
      };

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('Could not start screen recorder:', err);
      return false;
    }
  }

  public stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  private downloadVideo() {
    if (this.recordedChunks.length === 0) return;

    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `video-apresentacao-sistema-personal-${new Date().toISOString().substring(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

export const videoRecorderService = new VideoRecorderService();
