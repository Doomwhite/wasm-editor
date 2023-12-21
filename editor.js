// O caminho para o arquivo wasm da raiz do projeto
const arquivo = './target/wasm32-unknown-unknown/release/editor.wasm';

// Faz o download do arquivo e instancia o WebAssembly
WebAssembly.instantiateStreaming(fetch(arquivo))
  .then(wasm => {
    const { instance } = wasm;

    // A função "subtracao" está disponível no objeto "exports" da instância
    const { subtracao } = instance.exports;
    console.log(subtracao(28, 10)); // 18
  });
