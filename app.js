$(document).ready(function () {
  let descontoPercentual = 0;

  // 1.2.4 - Função de Formatação de Moeda Brasileira conforme o roteiro
  function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  // 1.2.1, 1.2.2 & Passo 3 - Função principal de Cálculo Total
  function calcularTotal() {
    // Leitura segura do lanche com fallback
    const precoLanche = parseFloat($('#select-lanche').val()) || 0;

    // Soma de Múltiplos Checkboxes Marcados via .each()
    let somaAdicionais = 0;
    $('.check-adicional:checked').each(function () {
      somaAdicionais += parseFloat($(this).val()) || 0;
    });

    // Leitura da Quantidade (parseInt com fallback 1)
    let qtd = parseInt($('#input-qtd').val()) || 1;

    // Subtotal
    const subtotal = (precoLanche + somaAdicionais) * qtd;

    // Taxa de Entrega
    const taxaEntrega = parseFloat($('#select-entrega').val()) || 0;

    // Desconto
    const valorDesconto = subtotal * (descontoPercentual / 100);

    // Total Geral
    const totalGeral = subtotal + taxaEntrega - valorDesconto;

    // Atualização da Interface Gráfica
    $('#res-lanche-unit').text(formatarMoeda(precoLanche));
    $('#res-adicionais').text(formatarMoeda(somaAdicionais));
    $('#res-subtotal').text(formatarMoeda(subtotal));
    $('#res-entrega').text(formatarMoeda(taxaEntrega));
    $('#res-desconto').text('- ' + formatarMoeda(valorDesconto));
    $('#total-geral').text(formatarMoeda(totalGeral));
  }

  // 1.2.3 - Escutadores de Eventos em Tempo Real (input e change)
  $('#select-lanche, #select-entrega, .check-adicional').on('change', calcularTotal);
  $('#input-qtd').on('input change', function () {
    let val = parseInt($(this).val());
    if (isNaN(val) || val < 1) $(this).val(1);
    calcularTotal();
  });

  // Botões de Incremento (+) e Decremento (-)
  $('#btn-mais').on('click', function () {
    let qtd = parseInt($('#input-qtd').val()) || 1;
    $('#input-qtd').val(qtd + 1).trigger('change');
  });

  $('#btn-menos').on('click', function () {
    let qtd = parseInt($('#input-qtd').val()) || 1;
    if (qtd > 1) {
      $('#input-qtd').val(qtd - 1).trigger('change');
    }
  });

  // Validação de Cupom
  $('#btn-aplicar-cupom').on('click', function () {
    const cupom = $('#input-cupom').val().trim().toUpperCase();
    const $msg = $('#msg-cupom');

    if (cupom === '20' || cupom === 'PROMO20') {
      descontoPercentual = 20;
      $msg.removeClass('d-none text-danger').addClass('text-success')
          .html('<i class="bi bi-check-circle-fill me-1"></i> Cupom de 20% aplicado!');
    } else if (cupom === '10' || cupom === 'PROMO10') {
      descontoPercentual = 10;
      $msg.removeClass('d-none text-danger').addClass('text-success')
          .html('<i class="bi bi-check-circle-fill me-1"></i> Cupom de 10% aplicado!');
    } else if (cupom === '') {
      descontoPercentual = 0;
      $msg.addClass('d-none');
    } else {
      descontoPercentual = 0;
      $msg.removeClass('d-none text-success').addClass('text-danger')
          .html('<i class="bi bi-exclamation-circle-fill me-1"></i> Cupom inválido.');
    }

    calcularTotal();
  });

  // Passo 4 - Salvar no LocalStorage (JSON.stringify)
  $('#btn-finalizar').on('click', function () {
    const adicionais = [];
    $('.check-adicional:checked').each(function () {
      adicionais.push($(this).attr('id'));
    });

    const pedido = {
      lanche: $('#select-lanche').val(),
      adicionais: adicionais,
      qtd: $('#input-qtd').val(),
      entrega: $('#select-entrega').val(),
      cupom: $('#input-cupom').val(),
      descontoPercentual: descontoPercentual
    };

    localStorage.setItem('rascunho_pedido', JSON.stringify(pedido));

    $('#alerta-sucesso').removeClass('d-none');
    setTimeout(() => {
      $('#alerta-sucesso').addClass('d-none');
    }, 3000);
  });

  // Limpar Pedido e LocalStorage
  $('#btn-limpar').on('click', function () {
    localStorage.removeItem('rascunho_pedido');
    
    // Reseta o formulário
    $('#form-pedido')[0].reset();
    descontoPercentual = 0;
    $('#msg-cupom').addClass('d-none');
    
    calcularTotal();
  });

  // Passo 4 - Restaurar rascunho do LocalStorage ao carregar a página (JSON.parse)
  function carregarRascunho() {
    const salvo = localStorage.getItem('rascunho_pedido');
    if (salvo) {
      const pedido = JSON.parse(salvo);
      $('#select-lanche').val(pedido.lanche);
      
      $('.check-adicional').prop('checked', false);
      if (pedido.adicionais && Array.isArray(pedido.adicionais)) {
        pedido.adicionais.forEach(id => $('#' + id).prop('checked', true));
      }

      $('#input-qtd').val(pedido.qtd);
      $('#select-entrega').val(pedido.entrega);
      $('#input-cupom').val(pedido.cupom);

      if (pedido.cupom) {
        $('#btn-aplicar-cupom').click();
      }
    }
  }

  // Inicialização ao carregar a página
  carregarRascunho();
  calcularTotal();
});