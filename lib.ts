import * as ffi from "ffi-napi";

const library = ffi.Library("./libs/mrwhatsapp_bot.dll", {
    create_thread: ["void", ["pointer"]],
    draw_qr: ["void", ["string"]],
    quit_window: ["void", []],
});

export function createThread(f: () => any) {
    const callback = ffi.Callback("void", [], f);
    library.create_thread(callback);
}

export function drawQR(input: string) {
    library.draw_qr(input + "\0");
}

export function quitWindow() {
    library.quit_window();
}
