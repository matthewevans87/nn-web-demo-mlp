import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-drawing-canvas',
  template: `
    <canvas
      #canvas
      width="280"
      height="280"
      (mousedown)="startDrawing($event)"
      (mousemove)="draw($event)"
      (mouseup)="stopDrawing()"
      (mouseleave)="stopDrawing()"
    >
    </canvas>
    <button (click)="clear()">Clear</button>
  `,
  styles: [
    `
      canvas {
        border: 2px solid #000;
        margin: 10px;
      }
    `,
  ],
})
export class DrawingCanvasComponent {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Output() imageData = new EventEmitter<number[]>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 25;
    this.ctx.lineCap = 'round';
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
    this.emitImageData();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, 280, 280);
    this.emitImageData();
  }

  private getMousePos(event: MouseEvent): [number, number] {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  private emitImageData() {
    // Get the full resolution image data
    const imageData = this.ctx.getImageData(0, 0, 280, 280);
    const data = new Array(784);

    // Downsample from 280x280 to 28x28
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        // Calculate the corresponding position in the 280x280 image
        const bigX = x * 10;
        const bigY = y * 10;

        // Average the 10x10 square of pixels
        let sum = 0;
        for (let dy = 0; dy < 10; dy++) {
          for (let dx = 0; dx < 10; dx++) {
            const idx = ((bigY + dy) * 280 + (bigX + dx)) * 4;
            sum += imageData.data[idx]; // Red channel (same as green and blue since we're grayscale)
          }
        }
        const average = sum / 100;

        // Convert to the format expected by the neural network
        // Index in the 1D array = y * 28 + x
        const idx = y * 28 + x;
        data[idx] = (255 - average) / 255; // Invert colors and normalize to 0-1
      }
    }

    this.imageData.emit(data);
  }
}
