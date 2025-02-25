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
  prediction: number | undefined = undefined;
  randomImageLabel = -1;
  currentImageData: number[] | null = null;
  showingMnistSample = false;
  hiddenActivations: number[] = new Array(20).fill(0);
  outputActivations: number[] = new Array(10).fill(0);

  constructor(
    private mlpService: MLPService,
    private mnistDataService: MnistDataService
  ) {}

  resetPrediction() {
    this.prediction = undefined;
    this.showingMnistSample = false;
  }

  onImageData(imageData: number[]) {
    const [hidden, output] = this.mlpService.forward(imageData);
    this.hiddenActivations = hidden;
    this.outputActivations = output;
    this.prediction = output.indexOf(Math.max(...output));
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
    this.hiddenActivations = [];
    this.outputActivations = [];
  }
}
