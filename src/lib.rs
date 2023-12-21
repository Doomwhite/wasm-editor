use core::slice::from_raw_parts_mut;

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
