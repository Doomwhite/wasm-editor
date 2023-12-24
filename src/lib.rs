use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, Layout};
use std::mem;

#[no_mangle]
pub extern "C" fn subtracao(numero_a: u8, numero_b: u8) -> u8 {
    numero_a - numero_b
}

#[no_mangle]
extern "C" fn criar_memoria_inicial() {
    let fatia: &mut [u8];

    unsafe {
        fatia = from_raw_parts_mut::<u8>(5 as *mut u8, 10);
    }

    fatia[0] = 85;
}

#[no_mangle]
extern "C" fn malloc(comprimento: usize) -> *mut u8 {
    let alinhamento = mem::align_of::<usize>();
    if let Ok(layout) = Layout::from_size_align(comprimento, alinhamento) {
        unsafe {
            if layout.size() > 0 {
                let ponteiro = alloc(layout);
                if !ponteiro.is_null() {
                    return ponteiro;
                }
            } else {
                return alinhamento as *mut u8;
            }
        }
    }
    std::process::abort()
}

#[no_mangle]
extern "C" fn acumular(ponteiro: *mut u8, comprimento: usize) -> i32 {
    let fatia = unsafe { from_raw_parts_mut(ponteiro as *mut u8, comprimento) };
    let mut soma = 0;
    for i in 0..comprimento {
        soma = soma + fatia[i];
    }
    soma as i32
}

#[no_mangle]
extern "C" fn filtro_preto_e_branco(ponteiro: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(ponteiro as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }
        let filtro = (pixels[i] / 3) + (pixels[i + 1] / 3) + (pixels[i + 2] / 3);
        pixels[i] = filtro;
        pixels[i + 1] = filtro;
        pixels[i + 2] = filtro;
        i += 4;
    }
}

#[no_mangle]
extern "C" fn filtro_vermelho(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // 0
        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        // 4
        pixels[i + 5] = pixels[i + 5] / 2;
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[no_mangle]
extern "C" fn filtro_verde(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        // 1
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        // 5
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[no_mangle]
extern "C" fn filtro_azul(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        pixels[i + 1] = pixels[i + 1] / 2;
        // 2
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        pixels[i + 5] = pixels[i + 5] / 2;
        // 6
        // 7
        i += 8;
    }
}

#[no_mangle]
extern "C" fn filtro_opacidade(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    let alfa = 10;
    loop {
        if i >= len - 1 {
            break;
        }

        let valor_atual = pixels[i + 3];
        if valor_atual >= alfa {
            pixels[i + 3] = valor_atual - alfa;
        } else {
            pixels[i + 3] = 0;
        };

        i += 4;
    }
}

#[no_mangle]
extern "C" fn filtro_inversao(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    for i in (0..len - 1).step_by(4) {
        pixels[i] = 255 - pixels[i];
        pixels[i + 1] = 255 - pixels[i + 1];
        pixels[i + 2] = 255 - pixels[i + 2];
    }
}
