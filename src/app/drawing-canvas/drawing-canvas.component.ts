import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss'],
})
export class DrawingCanvasComponent {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Output() imageData = new EventEmitter<number[]>();
  @Output() cleared = new EventEmitter<void>();
  @Input() set inputImageData(data: number[] | null) {
    if (data) {
      this.displayImage(data);
    }
  }

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d', {
      willReadFrequently: true,
    })!;
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    (this.ctx as any).imageSmoothingEnabled = false; // Disable anti-aliasing
    this.clear();
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = this.getMousePos(event);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    const [x, y] = this.getMousePos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    [this.lastX, this.lastY] = [x, y];
    this.thresholdImageData();
    this.emitImageData();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  public clear() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, 28, 28);
    this.cleared.emit();
  }

  private getMousePos(event: MouseEvent): [number, number] {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    return [
      (event.clientX - rect.left) * scaleX,
      (event.clientY - rect.top) * scaleY,
    ];
  }

  private getTouchPos(event: TouchEvent): [number, number] {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const touch = event.touches[0];
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;
    return [
      (touch.clientX - rect.left) * scaleX,
      (touch.clientY - rect.top) * scaleY,
    ];
  }

  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.isDrawing = true;
    [this.lastX, this.lastY] = this.getTouchPos(event);
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this.isDrawing) return;
    const [x, y] = this.getTouchPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    [this.lastX, this.lastY] = [x, y];
    this.thresholdImageData();
    this.emitImageData();
  }

  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.isDrawing = false;
  }

  private thresholdImageData() {
    const imageData = this.ctx.getImageData(0, 0, 28, 28);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const avg =
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      const color = avg < 128 ? 0 : 255;
      imageData.data[i] = color;
      imageData.data[i + 1] = color;
      imageData.data[i + 2] = color;
      imageData.data[i + 3] = 255;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  private emitImageData() {
    const imageData = this.ctx.getImageData(0, 0, 28, 28);
    const data = new Array(784);

    for (let i = 0; i < 784; i++) {
      // Invert the value since we're using black on white
      data[i] = 1 - imageData.data[i * 4] / 255;
    }

    this.imageData.emit(data);
  }

  displayImage(data: number[]) {
    if (!this.ctx) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
    }

    this.clear();

    const imageData = this.ctx.createImageData(28, 28);
    for (let i = 0; i < data.length; i++) {
      // Convert the MNIST value (0-1) to grayscale (0-255)
      // Invert the color since MNIST uses white on black, but we want black on white
      const value = 255 - data[i] * 255;
      const idx = i * 4;
      imageData.data[idx] = value; // R
      imageData.data[idx + 1] = value; // G
      imageData.data[idx + 2] = value; // B
      imageData.data[idx + 3] = 255; // A
    }

    this.ctx.putImageData(imageData, 0, 0);
    this.emitImageData();
  }
}
