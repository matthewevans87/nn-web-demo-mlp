import { Component, ViewChild } from '@angular/core';
import { MLPService } from './mlp.service';
import { MnistDataService } from './mnist-data.service';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild(DrawingCanvasComponent) drawingCanvas!: DrawingCanvasComponent;
  prediction = -1;
  randomImageLabel = -1;
  currentImageData: number[] | null = null;
  showingMnistSample = false;

  constructor(
    private mlpService: MLPService,
    private mnistDataService: MnistDataService
  ) {}

  resetPrediction() {
    this.prediction = -1;
    this.showingMnistSample = false;
  }

  onImageData(imageData: number[]) {
    this.prediction = this.mlpService.predict(imageData);
    // this.showingMnistSample = false;
    // this.randomImageLabel = -1;
  }

  showRandomImage() {
    const image = this.mnistDataService.getRandomImage();
    if (image) {
      this.currentImageData = image.pixels;
      this.randomImageLabel = image.label;
      this.prediction = this.mlpService.predict(image.pixels);
      this.showingMnistSample = true;
    }
  }

  clear() {
    this.drawingCanvas.clear();
    this.currentImageData = null;
    this.showingMnistSample = false;
    this.resetPrediction();
  }
}
