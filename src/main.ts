import "./style.css";
import { createInitialState } from "./state";

// İskelet: sadece başlangıç state'inin oluştuğunu doğrulamak için ekrana basıyoruz.
// Pomodoro/mola state machine'i ve render mantığı bir sonraki adımda eklenecek.
const state = createInitialState();
console.log("initial state", state);

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="skeleton-notice">
    <h1>Orman Pomodoro</h1>
    <p>İskelet kuruldu. Başlangıç state'i konsola yazıldı.</p>
    <p>Grid: ${state.grid.size}x${state.grid.size} · Faz: ${state.session.phase}</p>
  </div>
`;
