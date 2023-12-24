const arquivo =
	'./target/wasm32-unknown-unknown/release/editor.wasm';

WebAssembly
	.instantiateStreaming(fetch(arquivo))
	.then(({ instance }) => {
		const {
			subtracao,
			criar_memoria_inicial,
			memory,
			malloc,
			acumular,
			filtro_preto_e_branco,
			filtro_vermelho,
			filtro_verde,
			filtro_azul,
			filtro_opacidade,
			filtro_inversao
		} = instance.exports;

		adicionarFiltro('Preto e Branco WASM', '#preto-e-branco-wasm', {
			instance, filtro: filtro_preto_e_branco
		});
		adicionarFiltro('Vermelho WASM', '#vermelho-wasm', {
			instance, filtro: filtro_vermelho
		});
		adicionarFiltro('Azul WASM', '#azul-wasm', {
			instance, filtro: filtro_azul
		});
		adicionarFiltro('Verde WASM', '#verde-wasm', {
			instance, filtro: filtro_verde
		});
		adicionarFiltro('Opacidade WASM', '#opacidade-wasm', {
			instance, filtro: filtro_opacidade
		});
		adicionarFiltro('Inversão WASM', '#inversao-wasm', {
			instance, filtro: filtro_inversao
		});

		criar_memoria_inicial();
		const arrayMemoria = new Uint8Array(memory.buffer, 0)
			.slice(0, 10);
		console.log(arrayMemoria); // 85
		console.log(subtracao(28, 10)); // 18

		const jsLista = Uint8Array.from([20, 50, 80]);
		const comprimento = jsLista.length;
		const wasmListaPonteiro = malloc(comprimento);
		const wasmLista = new Uint8Array(
			memory.buffer, wasmListaPonteiro, comprimento
		);

		wasmLista.set(jsLista);
		const somaEntreItensDaLista = acumular(wasmListaPonteiro, comprimento);
		console.log(somaEntreItensDaLista); // 150
	});


const input = document.querySelector('input');

const botaoResetarFiltro = document.querySelector(
	'#remover');
const botaoPBFiltroJs = document.querySelector(
	'#preto-e-branco-js');
const botaoPBFiltroWasm = document.querySelector(
	'#preto-e-branco-wasm');

// Salva o atributo 'src' da imagem original.
let imagemOriginal = document.getElementById('imagem').src;

// Sempre que o valor do botão "input" for alterado,
// o código desta função será executado.
input.addEventListener('change', (event) => {
	const arquivo = event.target.files[0];
	const reader = new FileReader();

	// Seleciona o elemento imagem e atualiza
	// o título baseado no arquivo.
	const imagem = document.getElementById('imagem');
	imagem.title = arquivo.name;

	reader.onload = (event) => {
		// Quando o processo for finalizado salva o resultado no
		// atributo 'src' da imagem.
		// Também atualiza a variável imagemOriginal.
		imagem.src = event.target.result;
		imagemOriginal = event.target.result;
	};

	reader.readAsDataURL(arquivo);
});

// Sempre que o botão "#remover" for clicado,
// esta função será executada
botaoResetarFiltro.addEventListener('click', (event) => {
	const imagem = document.getElementById('imagem');
	imagem.src = imagemOriginal;
	console.log('Imagem voltou ao original');
});

function converteImagemParaCanvas(imagem) {
	// Cria a referência do canvas
	const canvas = document.createElement('canvas');

	// Seleciona o context 2d do canvas
	const contexto = canvas.getContext('2d');

	// Coloca a largura e altura do canvas similar à imagem
	canvas.width = imagem.naturalWidth || imagem.width;
	canvas.height = imagem.naturalHeight || imagem.height;

	// Desenha a imagem no contexto 2d
	contexto.drawImage(imagem, 0, 0);

	// Retorna tanto o canvas como seu contexto
	return { canvas, contexto };
}

function filtroPretoBrancoJS(canvas, contexto) {
	// Pega os dados da imagem
	const dadosDaImagem = contexto
		.getImageData(0, 0, canvas.width, canvas.height);

	// Pega os pixels da imagem
	const pixels = dadosDaImagem.data;

	const inicio = performance.now();

	// Performa a mudança em cada pixel da imagem de
	// acordo com a fórmula vista anteriormente
	for (var i = 0, n = pixels.length; i < n; i += 4) {
		const filtro = pixels[i] / 3 + pixels[i + 1] / 3 + pixels[i + 2] / 3;
		pixels[i] = filtro;
		pixels[i + 1] = filtro;
		pixels[i + 2] = filtro;
	}

	// Salva o tempo do fim
	const fim = performance.now();

	// Reporta o tempo que levou
	tempoDaOperacao(inicio, fim, 'JavaScript Preto e Branco');

	// Atualiza o canvas com os novos dados
	contexto.putImageData(dadosDaImagem, 0, 0);

	// Retorna um base64 do canvas
	return canvas.toDataURL('image/jpeg');
}

botaoPBFiltroJs.addEventListener('click', (event) => {
	// Seleciona a imagem
	const imagem = document.getElementById('imagem');

	// Converte a imagem para canvas
	const { canvas, contexto } = converteImagemParaCanvas(imagem);

	// Recebe o base64
	const base64 = filtroPretoBrancoJS(canvas, contexto);

	// Coloca o novo base64 na imagem
	imagem.src = base64;
});

function tempoDaOperacao(inicio, fim, nomeDaOperacao) {
	// Seleciona o elemento #performance
	const performance = document.querySelector('#performance');
	// Muda o texto de #performance para o tempo da execução
	performance.textContent = `${nomeDaOperacao}: ${fim - inicio} ms.`;
}

function adicionarFiltro(text, selector, { instance, filtro }) {
	const button = document.querySelector(selector);
	const imagem = document.getElementById('imagem');
	button.addEventListener('click', () => {
		executarFiltro(imagem, (canvas, context) => {
			const image = document.getElementById("imagem");
			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const buffer = imageData.data.buffer;
			const u8Array = new Uint8Array(buffer);
			let wasmClampedPtr = instance.exports.malloc(u8Array.length);
			let wasmClampedArray = new Uint8ClampedArray(instance.exports.memory.buffer, wasmClampedPtr, u8Array.length);
			wasmClampedArray.set(u8Array);
			const startTime = performance.now();
			filtro(wasmClampedPtr, u8Array.length);
			const endTime = performance.now();
			tempoDaOperacao(startTime, endTime, text);
			const width = image.naturalWidth || image.width;
			const height = image.naturalHeight || image.height;
			const newImageData = context.createImageData(width, height);
			newImageData.data.set(wasmClampedArray);
			context.putImageData(newImageData, 0, 0);
			image.src = canvas.toDataURL('image/jpeg');
		});
	});
}

function executarFiltro(image, processImageFn) {
	const { canvas } = converteImagemParaCanvas(image);
	if (!processImageFn) {
		return canvas.toDataURL();
	}

	if (typeof processImageFn === 'function') {
		processImageFn(canvas, canvas.getContext('2d'));
		return canvas.toDataURL('image/jpeg');
	}
}

