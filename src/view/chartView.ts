import type { ChartPoint } from '../stats/types';
import { strings } from '../i18n';

export function drawChart(canvas: HTMLCanvasElement, chartPts: ChartPoint[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height, pad = 24;
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#23282f';
  ctx.lineWidth = 1;
  for (let p = 0; p <= 4; p++) {
    const y = pad + (H - 2 * pad) * p / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#5a626d';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('100%', 2, pad + 3);
  ctx.fillText('0%', 8, H - pad + 3);

  if (chartPts.length < 2) {
    ctx.fillStyle = '#454c57';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText(strings.chart.emptyHint, pad + 10, H / 2);
    return;
  }

  const maxG = chartPts[chartPts.length - 1].g || 1;
  const X = (g: number) => pad + (W - 2 * pad) * (g / maxG);
  const Y = (v: number) => pad + (H - 2 * pad) * (1 - v);
  const series: [keyof ChartPoint, string][] = [
    ['loss', '#ef5b5b'],
    ['draw', '#f5a524'],
    ['win', '#46c46e'],
  ];
  for (const [k, col] of series) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    chartPts.forEach((p, i) => {
      const x = X(p.g), y = Y(p[k] as number);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  }
  ctx.fillStyle = '#5a626d';
  ctx.fillText(strings.chart.gamesLabel(maxG), W - pad - 58, H - pad + 16);
}
