import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-activation-display',
  template: `
    <div class="activation-display">
      <canvas #canvas [width]="width" [height]="height"></canvas>
      <div class="label" *ngIf="label">{{ label }}</div>
    </div>
  `,
  styleUrls: ['./activation-display.component.scss'],
})
export class ActivationDisplayComponent implements OnChanges {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() activations: number[] = [];
  @Input() label: string = '';
  @Input() pixelSize = 20;
  @Input() orientation: 'row' | 'column' = 'column';

  width = this.pixelSize;
  height = 0;

  ngOnChanges() {
    if (!this.canvas) return;

    // Set dimensions based on orientation
    if (this.orientation === 'column') {
      this.width = this.pixelSize;
      this.height = this.activations.length * this.pixelSize;
    } else {
      this.width = this.activations.length * this.pixelSize;
      this.height = this.pixelSize;
    }

    const ctx = this.canvas.nativeElement.getContext('2d')!;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw activation pixels
    this.activations.forEach((value, index) => {
      const grayscale = Math.floor((1 - value) * 255);
      ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
      if (this.orientation === 'column') {
        ctx.fillRect(0, index * this.pixelSize, this.pixelSize, this.pixelSize);
      } else {
        ctx.fillRect(index * this.pixelSize, 0, this.pixelSize, this.pixelSize);
      }
    });
  }
}
