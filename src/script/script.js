// ===== Configurações =====
const PASS_PERCENT = 0.70; // 70%
const MAX_POINTS = 18;     // 18 questões, 1 ponto por acerto

// Mapeamento C / N / I (1 / 0.5 / 0)
const SCORE_MAP = { C:1, N:0.5, I:0 };

// Estado
let totalScore = 0;
let userResponses = {};
let playerName = '';

// Função para iniciar o jogo a partir da tela inicial
function startGame() {
  const nameInput = document.getElementById('playerName');
  if (!nameInput || !nameInput.value.trim()) {
    alert('Por favor, digite seu nome para continuar!');
    return;
  }
  
  playerName = nameInput.value.trim();
  // Salva o nome no localStorage para usar na tela de perguntas
  localStorage.setItem('playerName', playerName);
  
  // Redireciona para a tela de perguntas
  window.location.href = 'perguntas.html';
}

const $ = (sel) => {
  const element = document.querySelector(sel);
  if (!element) {
    console.error(`Elemento não encontrado: ${sel}`);
    return null;
  }
  return element;
};

// Verifica se um elemento existe e é visível
const isVisible = (el) => {
  return el && !el.classList.contains('hidden');
};

// Progresso visual por nível (0..4)
function setProgress(levelIdx){
  const pct = Math.min(100, (levelIdx/4)*100);
  $('#progressBar').style.width = pct + '%';
  $('#levelBadge').textContent = `Nível ${Math.min(levelIdx+1,4)} de 4`;
}

function calcLevelScore(form){
  const data = new FormData(form);
  let s = 0;
  // Salva as respostas do usuário
  for (const [name, val] of data.entries()) {
    userResponses[name] = val;
    s += SCORE_MAP[val] || 0;
  }
  return s;
}

function lockForm(form){ form.querySelectorAll('input').forEach(el=>el.disabled=true); }
function unlockForm(form){ form.querySelectorAll('input').forEach(el=>el.disabled=false); }

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

// Confete simples
function shootConfetti(){
  const box = $('#confetti');
  box.innerHTML = '';
  const colors = ['#22d3ee','#a78bfa','#60a5fa','#34d399','#f472b6','#facc15'];
  for(let i=0;i<120;i++){
    const s = document.createElement('span');
    s.style.left = Math.random()*100+'%';
    s.style.background = colors[Math.floor(Math.random()*colors.length)];
    s.style.animationDelay = (Math.random()*0.8)+'s';
    s.style.transform = `translateY(-20px) rotate(${Math.random()*360}deg)`;
    box.appendChild(s);
  }
  setTimeout(()=> box.innerHTML='', 3000);
}

// Submissões por nível
$('#form1').addEventListener('submit', (e)=>{
  e.preventDefault();
  const sc = calcLevelScore(e.target); totalScore += sc;
  lockForm(e.target);
  hide($('#level1')); show($('#level2')); setProgress(1);
  $('#level2').scrollIntoView({behavior:'smooth'});
});

$('#form2').addEventListener('submit', (e)=>{
  e.preventDefault();
  const sc = calcLevelScore(e.target); totalScore += sc;
  lockForm(e.target);
  hide($('#level2')); show($('#level3')); setProgress(2);
  $('#level3').scrollIntoView({behavior:'smooth'});
});

$('#form3').addEventListener('submit', (e)=>{
  e.preventDefault();
  const sc = calcLevelScore(e.target); totalScore += sc;
  lockForm(e.target);
  hide($('#level3')); show($('#level4')); setProgress(3);
  $('#level4').scrollIntoView({behavior:'smooth'});
});

$('#form4').addEventListener('submit', (e)=>{
  e.preventDefault();
  const sc = calcLevelScore(e.target); totalScore += sc;
  lockForm(e.target);
  hide($('#level4')); setProgress(4);
  showFinal();
});

function generateFeedback() {
  let feedback = '';
  let areas = {
    aparencia: 0,
    idade: 0,
    diversidade: 0,
    comunicacao: 0,
    autoconhecimento: 0
  };
  
  // Analisa respostas por área
  const respostas = {
    // Nível 1
    tatuagens: userResponses.q11,
    universidade: userResponses.q12,
    sotaque: userResponses.q13,
    idade: userResponses.q14,
    vestuario: userResponses.q15,
    // Nível 2
    introversao: userResponses.q21,
    genero: userResponses.q22,
    historicoTrabalho: userResponses.q23,
    deficiencia: userResponses.q24,
    estrangeiros: userResponses.q25,
    // Nível 3
    autopercepção: userResponses.q31,
    similaridade: userResponses.q32,
    diversidade: userResponses.q33,
    justificativas: userResponses.q34,
    // Nível 4
    experiencia: userResponses.q41,
    aparencia: userResponses.q42,
    primeiraImpressao: userResponses.q43,
    mudancaOpiniao: userResponses.q44
  };
  
  feedback = '<h3>Análise de Vieses</h3>';

  let pontosFracos = [];
  let pontosFortes = [];

  // Análise de aparência e apresentação
  if (respostas.tatuagens === 'I' || respostas.vestuario === 'I' || respostas.aparencia === 'I') {
    pontosFracos.push('Você demonstra uma tendência a julgar candidatos por sua aparência física e apresentação pessoal. Isso pode levar à exclusão de talentos valiosos com base em critérios não relacionados à competência.');
  } else if (respostas.tatuagens === 'C' && respostas.vestuario === 'C') {
    pontosFortes.push('Você demonstra uma abordagem positiva ao não julgar candidatos por sua aparência ou escolhas pessoais de vestuário.');
  }

  // Análise de idade e experiência
  if (respostas.idade === 'I' || respostas.experiencia === 'I') {
    pontosFracos.push('Suas respostas indicam um viés relacionado à idade e experiência. Lembre-se que a capacidade de aprendizado e adaptação não está limitada à idade.');
  } else if (respostas.idade === 'C' && respostas.experiencia === 'C') {
    pontosFortes.push('Você demonstra uma visão equilibrada sobre idade e potencial de aprendizado.');
  }

  // Análise de diversidade e inclusão
  if (respostas.genero === 'I' || respostas.deficiencia === 'I' || respostas.estrangeiros === 'I') {
    pontosFracos.push('Há oportunidades de melhoria em sua abordagem à diversidade e inclusão. Considere como diferentes perspectivas podem enriquecer o ambiente de trabalho.');
  } else if (respostas.diversidade === 'C') {
    pontosFortes.push('Você demonstra um compromisso positivo com a diversidade e inclusão no ambiente de trabalho.');
  }

  // Análise de comunicação
  if (respostas.sotaque === 'I' || respostas.introversao === 'I') {
    pontosFracos.push('Suas respostas sugerem alguns preconceitos sobre diferentes estilos de comunicação. Considere que há múltiplas formas efetivas de se comunicar e trabalhar em equipe.');
  }

  // Autoconsciência
  if (respostas.autopercepção === 'C' || respostas.justificativas === 'C') {
    pontosFortes.push('Você demonstra boa autoconsciência sobre seus próprios vieses, o que é o primeiro passo para superá-los.');
  }

  // Gera o feedback final
  if (pontosFortes.length > 0) {
    feedback += '<div class="feedback-section positivo"><h4>Pontos Positivos</h4>';
    feedback += '<ul>' + pontosFortes.map(ponto => '<li>' + ponto + '</li>').join('') + '</ul></div>';
  }

  if (pontosFracos.length > 0) {
    feedback += '<div class="feedback-section atencao"><h4>Pontos de Atenção</h4>';
    feedback += '<ul>' + pontosFracos.map(ponto => '<li>' + ponto + '</li>').join('') + '</ul></div>';
  }

  // Recomendações personalizadas
  feedback += '<div class="feedback-section recomendacoes"><h4>Recomendações</h4><ul>';
  
  if (pontosFracos.length > 2) {
    feedback += '<li>Considere participar de treinamentos sobre diversidade e inclusão</li>';
    feedback += '<li>Implemente um processo estruturado de entrevista com critérios objetivos</li>';
    feedback += '<li>Busque feedback de uma equipe diversa durante o processo de contratação</li>';
  } else if (pontosFracos.length > 0) {
    feedback += '<li>Continue desenvolvendo sua consciência sobre vieses inconscientes</li>';
    feedback += '<li>Mantenha o foco em critérios objetivos durante as avaliações</li>';
  } else {
    feedback += '<li>Continue compartilhando suas boas práticas com outros recrutadores</li>';
    feedback += '<li>Ajude a criar uma cultura mais inclusiva em sua organização</li>';
  }
  
  feedback += '<li>Reavalie periodicamente seus critérios de seleção</li>';
  feedback += '</ul></div>';
  
  return feedback;
}

function showFinal(){
  try {
    const pct = (totalScore / MAX_POINTS) * 100;
    const finalMax = $('#finalMax');
    const finalScore = $('#finalScore');
    const finalPct = $('#finalPct');
    const finalTag = $('#finalTag');
    const finalSection = $('#final');

    if (!finalMax || !finalScore || !finalPct || !finalTag || !finalSection) {
      throw new Error('Elementos do resultado final não encontrados');
    }

    finalMax.textContent = MAX_POINTS;
    finalScore.textContent = Number(totalScore.toFixed(1));
    finalPct.textContent = pct.toFixed(0) + '%';
    
    const pass = pct >= PASS_PERCENT*100;
    const tag = pass ? `<span class="ok final-tag">APROVADO</span>` : `<span class="bad final-tag">REPROVADO</span>`;
    finalTag.innerHTML = tag;
    
    // Remove qualquer feedback existente
    const existingFeedback = finalSection.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
    
    // Adiciona o novo feedback personalizado
    const feedbackContent = generateFeedback();
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'feedback';
    feedbackEl.innerHTML = feedbackContent;
    finalSection.insertBefore(feedbackEl, finalSection.querySelector('.btns'));
    
    show(finalSection);
    finalSection.scrollIntoView({behavior:'smooth'});
    
    if(pass) shootConfetti();
  } catch (error) {
    console.error('Erro ao mostrar resultado final:', error);
    alert('Ocorreu um erro ao mostrar o resultado. Por favor, tente novamente.');
  }
}

// Reiniciar
$('#btnReiniciar').addEventListener('click', ()=>{
  totalScore = 0; setProgress(0);
  userResponses = {}; // Limpa as respostas
  ['form1','form2','form3','form4'].forEach(id=>{ const f = document.getElementById(id); f.reset(); unlockForm(f); });
  hide($('#final')); show($('#level1')); hide($('#level2')); hide($('#level3')); hide($('#level4'));
  window.scrollTo({top:0,behavior:'smooth'});
});

// Inicial
document.addEventListener('DOMContentLoaded', () => {
  setProgress(0);
  
  // Exibe o nome do jogador se estiver na tela de perguntas
  const playerWelcome = document.getElementById('playerWelcome');
  if (playerWelcome) {
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
      playerWelcome.textContent = `Bem-vindo(a), ${savedPlayerName}!`;
      playerName = savedPlayerName; // Atualiza a variável global
    }
  }
});
