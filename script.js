// Función para gestionar el tema oscuro/claro
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Función para establecer el tema
  function setTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
      isDarkMode = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.checked = false;
      isDarkMode = false;
    }
  }
  
  // Verificar si hay una preferencia guardada
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme === 'dark');
  } else {
    // Si no hay preferencia guardada, usar la preferencia del sistema
    setTheme(prefersDarkScheme.matches);
  }
  
  // Escuchar los cambios en el interruptor
  themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    isDarkMode = themeToggle.checked;
  });
  
  // Escuchar los cambios en las preferencias del sistema
  prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });
}

// Variables principales
let isBreathingActive = false;
let currentPhase = 'inhale'; // inhale, hold, exhale
let sessionSeconds = 0;
let sessionInterval;
let isDarkMode = true;

// Referencias a elementos DOM
let breathCircle = document.getElementById('breathCircle');
let breathText = document.getElementById('breathText');
let breathCounter = document.getElementById('breathCounter');
let sessionTimer = document.getElementById('sessionTimer');
let startButton = document.getElementById('startButton');
let progressBar = document.getElementById('progressBar');
let insightsButton = document.getElementById('insightsButton');
let insightsPanel = document.getElementById('insightsPanel');
let closePanel = null; // Se cargará dinámicamente
let notification = document.getElementById('notification');
let particlesContainer = document.getElementById('particles');
let settingsButton = document.getElementById('settingsButton');
let settingsPanel = document.getElementById('settingsPanel');
let closeSettingsPanel = null; // Se cargará dinámicamente
let musicButton = document.getElementById('musicButton');
let musicPanel = document.getElementById('musicPanel');
let closeMusicPanel = null; // Se cargará dinámicamente
let themeToggle = document.getElementById('themeToggle');
let currentYear = document.getElementById('currentYear');
let tabButtons = null; // Se cargará dinámicamente
let tabContents = null; // Se cargará dinámicamente

// Configuración de la respiración
const breathConfig = {
  inhale: 4,
  hold: 5,
  exhale: 6,
  transitionTime: 0.5 // segundos para transiciones
};

// Cargar los paneles HTML dinámicamente
async function loadPanels() {
  try {
    const response = await fetch('panels.html');
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Crear un elemento temporal para parsear el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Cargar contenido de cada panel
    const insightsPanelContent = tempDiv.querySelector('#insightsPanelContent')?.innerHTML;
    const settingsPanelContent = tempDiv.querySelector('#settingsPanelContent')?.innerHTML;
    const musicPanelContent = tempDiv.querySelector('#musicPanelContent')?.innerHTML;
    
    if (!insightsPanelContent || !settingsPanelContent || !musicPanelContent) {
      console.error('No se encontraron todos los contenidos de panel en panels.html');
      return false;
    }
    
    // Insertar el contenido en los paneles
    const insightsPanelElement = document.getElementById('insightsPanel');
    const settingsPanelElement = document.getElementById('settingsPanel');
    const musicPanelElement = document.getElementById('musicPanel');
    
    if (!insightsPanelElement || !settingsPanelElement || !musicPanelElement) {
      console.error('No se encontraron los contenedores de panel en el DOM');
      return false;
    }
    
    insightsPanelElement.innerHTML = insightsPanelContent;
    settingsPanelElement.innerHTML = settingsPanelContent;
    musicPanelElement.innerHTML = musicPanelContent;
    
    console.log("Paneles cargados correctamente");
    
    // Actualizar referencias a elementos DOM después de cargar el contenido
    updateDOMReferences();
    
    return true;
  } catch (error) {
    console.error('Error cargando los paneles:', error);
    // Si hay un error, mostrar un mensaje al usuario
    showNotification("Error cargando componentes. Por favor, actualiza la página.");
    return false;
  }
}

// Actualizar referencias DOM después de cargar el contenido
function updateDOMReferences() {
  // Actualizar referencias a elementos que se cargan dinámicamente
  closePanel = document.getElementById('closePanel');
  closeSettingsPanel = document.getElementById('closeSettingsPanel');
  closeMusicPanel = document.getElementById('closeMusicPanel');
  tabButtons = document.querySelectorAll('.tab-button');
  tabContents = document.querySelectorAll('.tab-content');
  
  // Configurar event listeners para los nuevos elementos
  setupEventListeners();
}

// Inicializar partículas
function createParticles() {
  if (!particlesContainer) {
    console.warn('Contenedor de partículas no encontrado');
    return;
  }
  
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    createParticle();
  }
}

function createParticle() {
  if (!particlesContainer) return;
  
  const particle = document.createElement('div');
  particle.classList.add('particle');
  
  // Tamaño aleatorio
  const size = Math.random() * 10 + 5;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  
  // Posición inicial aleatoria
  const posX = Math.random() * window.innerWidth;
  const posY = Math.random() * window.innerHeight;
  particle.style.left = `${posX}px`;
  particle.style.top = `${posY}px`;
  
  // Opacidad aleatoria
  particle.style.opacity = Math.random() * 0.5 + 0.1;
  
  // Añadir al contenedor
  particlesContainer.appendChild(particle);
  
  // Animar la partícula
  animateParticle(particle);
}

function animateParticle(particle) {
  // Duración aleatoria de la animación
  const duration = Math.random() * 90 + 30;
  
  // Posición final aleatoria
  const endPosX = Math.random() * window.innerWidth;
  const endPosY = Math.random() * window.innerHeight;
  
  // Configurar la animación con keyframes
  particle.animate([
    { 
      transform: 'translate(0, 0)',
      opacity: particle.style.opacity
    },
    { 
      transform: `translate(${endPosX - parseInt(particle.style.left)}px, ${endPosY - parseInt(particle.style.top)}px)`,
      opacity: 0
    }
  ], {
    duration: duration * 1000,
    easing: 'ease-out',
    fill: 'forwards'
  }).onfinish = () => {
    // Eliminar partícula vieja y crear una nueva
    particle.remove();
    createParticle();
  };
}

// Formatear tiempo para el cronómetro
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Actualizar el cronómetro
function updateTimer() {
  sessionSeconds++;
  if (sessionTimer) {
    sessionTimer.textContent = formatTime(sessionSeconds);
  }
  
  // Actualizar progreso (ejemplo simple)
  if (sessionSeconds % 30 === 0 && progressBar) {
    const currentProgress = parseInt(progressBar.style.width || '35');
    if (currentProgress < 95) {
      progressBar.style.width = `${currentProgress + 1}%`;
    }
  }
  
  // Mostrar notificación de aliento ocasionalmente
  if (sessionSeconds % 90 === 0) {
    const messages = [
      "¡Mantén este ritmo! Estás en la zona óptima.",
      "Excelente coherencia respiratoria. Continúa así.",
      "Tu ritmo cardíaco está sincronizado con tu respiración.",
      "Has alcanzado un estado de calma óptimo."
    ];
    
    showNotification(messages[Math.floor(Math.random() * messages.length)]);
  }
}

// Mostrar notificación con mensaje personalizable
function showNotification(message) {
  // Buscar el elemento de notificación
  let notificationElement = document.getElementById('notification');
  
  // Si no existe, crear uno
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'notification';
    
    // Crear el ícono SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M22 11.08V12a10 10 0 1 1-5.93-9.14');
    svg.appendChild(path);
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '22 4 12 14.01 9 11.01');
    svg.appendChild(polyline);
    
    // Crear el elemento span para el mensaje
    const span = document.createElement('span');
    
    // Agregar los elementos al contenedor de notificación
    notificationElement.appendChild(svg);
    notificationElement.appendChild(span);
    
    // Agregar estilos si no existen
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 1rem 2rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          opacity: 0;
          transition: all 0.5s;
          z-index: 1001;
        }
        .notification.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Agregar la notificación al cuerpo del documento
    document.body.appendChild(notificationElement);
    notification = notificationElement; // Actualizar la referencia global
  }
  
  // Actualizar el mensaje
  const messageSpan = notificationElement.querySelector('span');
  if (messageSpan) {
    messageSpan.textContent = message;
  }
  
  // Mostrar la notificación
  notificationElement.classList.add('show');
  
  // Ocultar después de un tiempo
  setTimeout(() => {
    notificationElement.classList.remove('show');
  }, 5000);
}

// Controlar la animación de respiración
function breathingAnimation() {
  if (!isBreathingActive || !breathText || !breathCounter || !breathCircle) return;
  
  if (currentPhase === 'inhale') {
    breathText.textContent = 'Inhala...';
    breathCounter.textContent = breathConfig.inhale;
    breathCircle.style.animation = `pulse ${breathConfig.inhale}s ease-in forwards`;
    
    setTimeout(() => {
      if (!isBreathingActive) return;
      currentPhase = 'hold';
      breathingAnimation();
    }, breathConfig.inhale * 1000);
    
  } else if (currentPhase === 'hold') {
    breathText.textContent = 'Mantén...';
    breathCounter.textContent = breathConfig.hold;
    breathCircle.style.animation = 'none';
    
    setTimeout(() => {
      if (!isBreathingActive) return;
      currentPhase = 'exhale';
      breathingAnimation();
    }, breathConfig.hold * 1000);
    
  } else if (currentPhase === 'exhale') {
    breathText.textContent = 'Exhala...';
    breathCounter.textContent = breathConfig.exhale;
    breathCircle.style.animation = `pulse ${breathConfig.exhale}s ease-out reverse forwards`;
    
    setTimeout(() => {
      if (!isBreathingActive) return;
      currentPhase = 'inhale';
      breathingAnimation();
    }, breathConfig.exhale * 1000);
  }
}

// Iniciar/Detener sesión de respiración
function toggleBreathingSession() {
  if (!startButton || !breathCircle) return;
  
  isBreathingActive = !isBreathingActive;
  
  if (isBreathingActive) {
    startButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
      Pausar
    `;
    currentPhase = 'inhale';
    breathingAnimation();
    sessionInterval = setInterval(updateTimer, 1000);
  } else {
    startButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      Continuar
    `;
    breathCircle.style.animation = 'none';
    clearInterval(sessionInterval);
  }
}

// Gestionar paneles 
function togglePanel(panel) {
  if (!panel) return;
  
  // Cerrar todos los paneles primero
  if (insightsPanel) insightsPanel.classList.remove('open');
  if (settingsPanel) settingsPanel.classList.remove('open');
  if (musicPanel) musicPanel.classList.remove('open');
  
  // Abrir el panel solicitado
  panel.classList.add('open');
}

// Manejar pestañas en insights
function setupTabs() {
  if (!tabButtons || tabButtons.length === 0) return;
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Desactivar todas las pestañas
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Activar la pestaña seleccionada
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const tabContent = document.getElementById(`${tabId}Tab`);
      if (tabContent) {
        tabContent.classList.remove('hidden');
      }
    });
  });
}

// Configuración de event listeners básicos
function setupEventListeners() {
  // Listeners para elementos que se cargan dinámicamente
  if (closePanel) {
    closePanel.addEventListener('click', () => {
      if (insightsPanel) insightsPanel.classList.remove('open');
    });
  }
  
  if (closeSettingsPanel) {
    closeSettingsPanel.addEventListener('click', () => {
      if (settingsPanel) settingsPanel.classList.remove('open');
    });
  }
  
  if (closeMusicPanel) {
    closeMusicPanel.addEventListener('click', () => {
      if (musicPanel) musicPanel.classList.remove('open');
    });
  }
  
  // Configurar pestañas
  setupTabs();
  
  // Botones de aplicar técnica recomendada
  const applyButtons = document.querySelectorAll('.apply-button');
  if (applyButtons && applyButtons.length > 0) {
    applyButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Simular aplicación de técnica 4-7-8
        Object.assign(breathConfig, { name: '4-7-8', inhale: 4, hold: 7, exhale: 8 });
        if (breathCounter) {
          breathCounter.textContent = '4-7-8';
        }
        
        if (insightsPanel) {
          insightsPanel.classList.remove('open');
        }
        showNotification("Técnica 4-7-8 aplicada");
      });
    });
  }
}

// Configurar botones principales
function setupMainButtons() {
  // Referencias directas a los botones estándar
  if (startButton) {
    startButton.addEventListener('click', toggleBreathingSession);
  }
  
  if (insightsButton && insightsPanel) {
    insightsButton.addEventListener('click', () => togglePanel(insightsPanel));
  }
  
  if (settingsButton && settingsPanel) {
    settingsButton.addEventListener('click', () => togglePanel(settingsPanel));
  }
  
  if (musicButton && musicPanel) {
    musicButton.addEventListener('click', () => togglePanel(musicPanel));
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = !isDarkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      isDarkMode = !isDarkMode;
    });
  }
  
  if (breathCircle) {
    breathCircle.addEventListener('click', () => {
      if (!isBreathingActive) {
        toggleBreathingSession();
      }
    });
  }
  
  function fixSpecificButtons() {
    console.log("Arreglando botones específicos...");
    
    // 1. Arreglar el botón que señalaste con la flecha en la imagen (probablemente un botón de información)
    const infoButtons = document.querySelectorAll('button svg[viewBox="0 0 24 24"]');
    infoButtons.forEach(svg => {
      const button = svg.closest('button');
      if (button && !button.hasListener) {
        button.hasListener = true; // Marcar para evitar duplicación
        button.addEventListener('click', function() {
          // Determinar qué panel debería abrirse basado en el contexto del botón
          if (this.parentElement && this.parentElement.classList.contains('theme-toggle')) {
            return; // Ignorar si es el botón de tema
          }
          
          // Verificar si tiene algún id o clase específica
          const buttonId = this.id || '';
          const buttonClasses = this.className || '';
          
          if (buttonId.includes('setting') || buttonClasses.includes('setting')) {
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel) {
              togglePanel(settingsPanel);
            }
          } else if (buttonId.includes('insight') || buttonClasses.includes('insight')) {
            const insightsPanel = document.getElementById('insightsPanel');
            if (insightsPanel) {
              togglePanel(insightsPanel);
            }
          } else if (buttonId.includes('help') || buttonClasses.includes('help')) {
            // Abrir panel de configuración por defecto para botones de ayuda
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel) {
              togglePanel(settingsPanel);
            }
          } else {
            // Si no podemos determinar qué panel abrir, usar configuración por defecto
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel) {
              togglePanel(settingsPanel);
            }
          }
        });
      }
    });
    
    // 2. Arreglar botones específicos por texto
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
      if (button.hasListener) return; // Evitar duplicación
      
      const buttonText = button.textContent.trim().toLowerCase();
      
      if (buttonText.includes('comenzar')) {
        button.hasListener = true;
        setupStartButton(button);
      } 
      else if (buttonText.includes('técnica')) {
        button.hasListener = true;
        setupTechniqueButton(button);
      }
      else if (buttonText.includes('música') || buttonText.includes('musica')) {
        button.hasListener = true;
        button.addEventListener('click', function() {
          const musicPanel = document.getElementById('musicPanel');
          if (musicPanel) {
            // Asegurar que el panel tenga contenido
            if (musicPanel.children.length === 0) {
              createBasicMusicPanel(musicPanel);
            }
            togglePanel(musicPanel);
          } else {
            // Fallback
            playDefaultAmbientSound();
          }
        });
      }
      else if (buttonText.includes('compartir')) {
        button.hasListener = true;
        setupShareButton(button);
      }
    });
    
    // 3. Arreglar teclas específicas
    document.addEventListener('keydown', function(event) {
      // Escape cierra todos los paneles
      if (event.key === 'Escape') {
        const insightsPanel = document.getElementById('insightsPanel');
        const settingsPanel = document.getElementById('settingsPanel');
        const musicPanel = document.getElementById('musicPanel');
        
        if (insightsPanel) insightsPanel.classList.remove('open');
        if (settingsPanel) settingsPanel.classList.remove('open');
        if (musicPanel) musicPanel.classList.remove('open');
      }
    });
    
    return true;
  }
  
  // Función para agregar tooltips a botones
  function addTooltipsToButtons() {
    // Agregar tooltips a botones que podrían no ser claros
    const iconButtons = document.querySelectorAll('button svg');
    iconButtons.forEach(svg => {
      const button = svg.closest('button');
      if (!button) return;
      
      // Determinar el tooltip basado en el contenido SVG o clases
      let tooltip = '';
      const svgPath = svg.innerHTML || '';
      
      if (button.id === 'settingsButton' || svgPath.includes('circle cx="12" cy="12" r="3"')) {
        tooltip = 'Configuración';
      } else if (button.id === 'insightsButton' || svgPath.includes('circle cx="12" cy="12" r="10"')) {
        tooltip = 'Insights y estadísticas';
      } else if (svgPath.includes('polygon points="5 3 19 12 5 21 5 3"')) {
        tooltip = 'Comenzar/Pausar';
      } else if (svgPath.includes('path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"')) {
        tooltip = 'Cambiar técnica';
      } else if (svgPath.includes('path d="M9 18V5l12-2v13"')) {
        tooltip = 'Sonidos ambientales';
      } else if (svgPath.includes('circle cx="18" cy="5" r="3"')) {
        tooltip = 'Compartir';
      }
      
      if (tooltip) {
        button.setAttribute('data-tooltip', tooltip);
        
        // Agregar elemento de tooltip
        const style = document.createElement('style');
        if (!document.getElementById('tooltip-style')) {
          style.id = 'tooltip-style';
          style.textContent = `
            [data-tooltip] {
              position: relative;
            }
            [data-tooltip]:hover::after {
              content: attr(data-tooltip);
              position: absolute;
              bottom: -35px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-size: 0.8rem;
              white-space: nowrap;
              z-index: 1000;
              pointer-events: none;
            }
          `;
          document.head.appendChild(style);
        }
      }
    });
  }

  // Buscar botones por texto si no se encontraron por ID
  const findButtonByText = (textContent) => {
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent.trim().toLowerCase().includes(textContent.toLowerCase())) {
        return button;
      }
    }
    return null;
  };
  
  // Configurar botón comenzar alternativo
  if (!startButton) {
    const altStartButton = findButtonByText('Comenzar');
    if (altStartButton) {
      setupStartButton(altStartButton);
    }
  } else {
    setupStartButton(startButton);
  }
  
  // Configurar botón técnicas alternativo
  const techButton = document.getElementById('techniqueButton') || findButtonByText('Técnica');
  if (techButton) {
    setupTechniqueButton(techButton);
  }
  
  // Configurar botón música alternativo
  const altMusicButton = !musicButton ? findButtonByText('Música') || findButtonByText('Musica') : null;
  if (altMusicButton) {
    setupMusicButton(altMusicButton);
  } else if (musicButton) {
    setupMusicButton(musicButton);
  }
  
  // Configurar botón compartir
  const shareButton = document.getElementById('shareButton') || findButtonByText('Compartir');
  if (shareButton) {
    setupShareButton(shareButton);
  }
}

// Configurar el botón de comenzar/pausar
function setupStartButton(button) {
  if (!button) return;
  
  button.addEventListener('click', function() {
    toggleBreathingSession();
    
    // Cambiar el texto del botón según el estado
    if (isBreathingActive) {
      this.querySelector('span') ? this.querySelector('span').textContent = 'Pausar' : this.textContent = 'Pausar';
    } else {
      this.querySelector('span') ? this.querySelector('span').textContent = 'Comenzar' : this.textContent = 'Comenzar';
    }
  });
}

// Configurar el botón de técnicas
function setupTechniqueButton(button) {
  if (!button) return;
  
  button.addEventListener('click', function() {
    const techniques = [
      { name: '4-5-6', inhale: 4, hold: 5, exhale: 6 },
      { name: '4-7-8', inhale: 4, hold: 7, exhale: 8 },
      { name: '5-5-5', inhale: 5, hold: 5, exhale: 5 },
      { name: '2-1-4', inhale: 2, hold: 1, exhale: 4 }
    ];
    
    // Encontrar la técnica actual y cambiar a la siguiente
    const currentTechIndex = techniques.findIndex(t => 
      t.inhale === breathConfig.inhale && 
      t.hold === breathConfig.hold && 
      t.exhale === breathConfig.exhale
    );
    
    const nextTech = techniques[(currentTechIndex + 1) % techniques.length];
    Object.assign(breathConfig, nextTech);
    
    // Actualizar el contador
    if (breathCounter) {
      breathCounter.textContent = nextTech.name;
    } else {
      const circleText = document.querySelector('.breathing-circle span, .inner-circle');
      if (circleText) circleText.textContent = nextTech.name;
    }
    
    // Mostrar notificación
    showNotification(`Técnica cambiada a ${nextTech.name}`);
  });
}

// Configurar el botón de música
function setupMusicButton(button) {
  if (!button) return;
  
  button.addEventListener('click', function() {
    // Si existe el panel de música, mostrarlo
    const musicPanelElement = document.getElementById('musicPanel');
    if (musicPanelElement) {
      togglePanel(musicPanelElement);
    } else {
      // Implementación rápida si no existe panel
      playDefaultAmbientSound();
    }
  });
}

// Reproducir sonido ambiental por defecto
function playDefaultAmbientSound() {
  // Verificar si ya existe un elemento de audio
  let audioElement = document.getElementById('ambientSound');
  
  if (!audioElement) {
    // Crear elemento de audio si no existe
    audioElement = document.createElement('audio');
    audioElement.id = 'ambientSound';
    audioElement.loop = true;
    audioElement.volume = 0.5;
    
    // URL a un sonido de ambiente (lluvia suave)
    audioElement.src = 'https://freesound.org/data/previews/346/346170_5121236-lq.mp3';
    document.body.appendChild(audioElement);
  }
  
  // Alternar reproducción/pausa
  if (audioElement.paused) {
    audioElement.play()
      .then(() => showNotification('Reproduciendo sonido de lluvia'))
      .catch(err => {
        console.error('Error al reproducir audio:', err);
        showNotification('No se pudo reproducir el audio. Intente más tarde.');
      });
  } else {
    audioElement.pause();
    showNotification('Sonido pausado');
  }
}

// Configurar el botón de compartir
function setupShareButton(button) {
  if (!button) return;
  
  button.addEventListener('click', function() {
    // Comprobar si la API Web Share está disponible
    if (navigator.share) {
      navigator.share({
        title: 'RespiraVida - Mi sesión de meditación',
        text: `¡He completado una sesión de meditación con RespiraVida usando la técnica ${breathConfig.inhale}-${breathConfig.hold}-${breathConfig.exhale}!`,
        url: window.location.href
      })
      .then(() => console.log('Contenido compartido con éxito'))
      .catch((error) => console.error('Error al compartir:', error));
    } else {
      // Fallback si la API no está disponible
      const shareText = `¡He completado una sesión de meditación con RespiraVida usando la técnica ${breathConfig.inhale}-${breathConfig.hold}-${breathConfig.exhale}!`;
      
      // Crear un textarea temporal, copiar el texto y eliminarlo
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      showNotification('Texto copiado al portapapeles. ¡Compártelo en tus redes!');
    }
  });
}

function checkAndFixPanels() {
  console.log("Verificando paneles...");
  
  // 1. Verificar si los contenedores existen
  const insightsPanelEl = document.getElementById('insightsPanel');
  const settingsPanelEl = document.getElementById('settingsPanel');
  const musicPanelEl = document.getElementById('musicPanel');
  
  if (!insightsPanelEl || !settingsPanelEl || !musicPanelEl) {
    console.error('Faltan paneles en el DOM');
    return false;
  }
  
  // 2. Verificar si los paneles están vacíos
  if (insightsPanelEl.children.length === 0) {
    console.log("Panel de insights vacío, corrigiendo...");
    createBasicInsightsPanel(insightsPanelEl);
  }
  
  if (settingsPanelEl.children.length === 0) {
    console.log("Panel de configuración vacío, corrigiendo...");
    createBasicSettingsPanel(settingsPanelEl);
  }
  
  if (musicPanelEl.children.length === 0) {
    console.log("Panel de música vacío, corrigiendo...");
    createBasicMusicPanel(musicPanelEl);
  }
  
  return true;
}

// Funciones auxiliares para crear contenido básico en los paneles
function createBasicInsightsPanel(panel) {
  panel.innerHTML = `
    <button class="close-panel" id="closePanel">×</button>
    <h2 class="insights-title">Tus Insights de Meditación</h2>
    
    <div class="insight-card highlight-card">
      <div class="insight-header">
        <h3>Sesión destacada</h3>
        <span class="insight-date">Hoy</span>
      </div>
      <p>Has completado una sesión de meditación con éxito.</p>
      <div class="card-badges">
        <span class="badge">15 min</span>
        <span class="badge">${breathConfig.inhale}-${breathConfig.hold}-${breathConfig.exhale}</span>
      </div>
    </div>
    
    <div class="insight-card">
      <div class="insight-header">
        <h3>Recomendación</h3>
        <span class="insight-date">Basado en tu progreso</span>
      </div>
      <p>Prueba la técnica de respiración 4-7-8 para mejorar tu concentración.</p>
      <button class="apply-button">Aplicar ahora</button>
    </div>
  `;
  
  // Configurar botón de cierre
  const closeBtn = panel.querySelector('#closePanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });
  }
  
  // Configurar botón aplicar
  const applyBtn = panel.querySelector('.apply-button');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      if (typeof breathConfig !== 'undefined') {
        Object.assign(breathConfig, { inhale: 4, hold: 7, exhale: 8 });
        const counter = document.getElementById('breathCounter');
        if (counter) counter.textContent = '4-7-8';
      }
      panel.classList.remove('open');
      showNotification("Técnica 4-7-8 aplicada");
    });
  }
}

function createBasicSettingsPanel(panel) {
  panel.innerHTML = `
    <button class="close-panel" id="closeSettingsPanel">×</button>
    <h2 class="settings-title">Configuración</h2>
    
    <div class="settings-section">
      <h3>Preferencias</h3>
      
      <div class="settings-option">
        <label for="notificationToggle">Notificaciones</label>
        <label class="switch">
          <input type="checkbox" id="notificationToggle" checked>
          <span class="theme-slider"></span>
        </label>
      </div>
      
      <div class="settings-option">
        <label for="soundToggle">Sonidos</label>
        <label class="switch">
          <input type="checkbox" id="soundToggle" checked>
          <span class="theme-slider"></span>
        </label>
      </div>
    </div>
    
    <div class="settings-section">
      <h3>Sobre</h3>
      <p class="version-info">RespiraVida v1.2.0</p>
      <div class="about-links">
        <a href="#" class="about-link">Términos de servicio</a>
        <a href="#" class="about-link">Política de privacidad</a>
      </div>
    </div>
  `;
  
  // Configurar botón de cierre
  const closeBtn = panel.querySelector('#closeSettingsPanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });
  }
}

function createBasicMusicPanel(panel) {
  panel.innerHTML = `
    <button class="close-panel" id="closeMusicPanel">×</button>
    <h2 class="music-title">Sonidos ambientales</h2>
    
    <div class="current-track">
      <div class="album-art">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <path d="M12 14 A2 2 0 0 0 12 10 A6 6 0 0 1 12 2 A9 9 0 0 1 12 22 A6 6 0 0 1 12 14"></path>
        </svg>
      </div>
      <div class="track-info">
        <p class="track-name">Lluvia suave</p>
        <p class="track-artist">Sonidos de la naturaleza</p>
      </div>
      <div class="player-controls">
        <button class="player-button" id="prevButton">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
          </svg>
        </button>
        <button class="player-button play" id="playButton">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </button>
        <button class="player-button" id="nextButton">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="volume-control">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      <input type="range" min="0" max="100" value="65" class="volume-slider" id="volumeSlider">
    </div>
    
    <div class="sound-library">
      <h3>Biblioteca de sonidos</h3>
      
      <div class="sound-categories">
        <button class="category-button active">Naturaleza</button>
        <button class="category-button">Meditación</button>
        <button class="category-button">Binaural</button>
      </div>
      
      <div class="sound-list">
        <div class="sound-item active" data-sound="rain">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 2v20M16 2v20M2 8h20M2 16h20"></path>
          </svg>
          <span>Lluvia suave</span>
          <span class="sound-duration">3:45</span>
        </div>
        <div class="sound-item" data-sound="ocean">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 2h-3a5 5 0 0 0-5 5v14"></path>
            <path d="M10 18a5 5 0 0 1-5 5H2"></path>
            <path d="M6 14a5 5 0 0 1-5-5V6"></path>
            <path d="M14 6a5 5 0 0 1 5-5h3"></path>
          </svg>
          <span>Océano</span>
          <span class="sound-duration">5:20</span>
        </div>
        <div class="sound-item" data-sound="forest">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2v6H1v14h22V2z"></path>
          </svg>
          <span>Bosque</span>
          <span class="sound-duration">6:30</span>
        </div>
      </div>
    </div>
  `;
  
  // Configurar botón de cierre
  const closeBtn = panel.querySelector('#closeMusicPanel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });
  }
  
  // Configurar reproducción de audio
  setupAudioControls(panel);
}

// Configurar controles de audio
function setupAudioControls(panel) {
  // Crear elemento de audio si no existe
  let audioElement = document.getElementById('ambientSound');
  if (!audioElement) {
    audioElement = document.createElement('audio');
    audioElement.id = 'ambientSound';
    audioElement.loop = true;
    document.body.appendChild(audioElement);
  }
  
  // Asignar fuentes de audio
  const audioSources = {
    'rain': 'https://freesound.org/data/previews/346/346170_5121236-lq.mp3',
    'ocean': 'https://freesound.org/data/previews/333/333078_5260872-lq.mp3',
    'forest': 'https://freesound.org/data/previews/475/475339_9254689-lq.mp3'
  };
  
  // Configurar volumen inicial
  audioElement.volume = 0.65;
  
  // Botón de reproducción
  const playButton = panel.querySelector('#playButton');
  if (playButton) {
    playButton.addEventListener('click', function() {
      if (audioElement.paused) {
        // Si no hay fuente asignada, usar lluvia por defecto
        if (!audioElement.src) {
          audioElement.src = audioSources['rain'];
        }
        
        audioElement.play()
          .then(() => {
            this.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <rect x="8" y="8" width="3" height="8"></rect>
                <rect x="14" y="8" width="3" height="8"></rect>
              </svg>
            `;
            showNotification('Reproduciendo sonido ambiental');
          })
          .catch(err => {
            console.error('Error al reproducir audio:', err);
            showNotification('No se pudo reproducir el audio. Intente más tarde.');
          });
      } else {
        audioElement.pause();
        this.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        `;
        showNotification('Sonido pausado');
      }
    });
  }
  
  // Control de volumen
  const volumeSlider = panel.querySelector('#volumeSlider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      audioElement.volume = volumeSlider.value / 100;
    });
  }
  
  // Selección de sonidos
  const soundItems = panel.querySelectorAll('.sound-item');
  soundItems.forEach(item => {
    item.addEventListener('click', function() {
      const soundId = this.getAttribute('data-sound');
      if (soundId && audioSources[soundId]) {
        // Actualizar selección visual
        soundItems.forEach(si => si.classList.remove('active'));
        this.classList.add('active');
        
        // Actualizar fuente de audio
        const wasPlaying = !audioElement.paused;
        audioElement.src = audioSources[soundId];
        
        // Actualizar texto
        const trackName = panel.querySelector('.track-name');
        if (trackName) {
          trackName.textContent = this.querySelector('span').textContent;
        }
        
        // Continuar reproducción si estaba reproduciéndose
        if (wasPlaying) {
          audioElement.play()
            .catch(err => console.error('Error cambiando sonido:', err));
        }
        
        showNotification(`Sonido cambiado a ${this.querySelector('span').textContent}`);
      }
    });
  });
}

// Inicialización
async function init() {
  try {
    // Configurar tema primero
    setupThemeToggle();
    
    // Establecer año actual en el footer
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
    
    // Verificar y arreglar paneles antes de cargarlos
    checkAndFixPanels();
    
    // Cargar paneles dinámicamente (si es necesario)
    let panelsLoaded = true;
    if (typeof loadPanels === 'function') {
      try {
        panelsLoaded = await loadPanels();
      } catch (panelError) {
        console.error("Error cargando paneles:", panelError);
        panelsLoaded = false;
      }
    }
    
    // Si los paneles no se cargaron, verificar y arreglar de nuevo
    if (!panelsLoaded) {
      console.warn("Carga dinámica de paneles falló, usando contenido generado");
      checkAndFixPanels();
    }
    
    // Crear partículas de fondo
    createParticles();
    
    // Configurar parámetros iniciales
    if (breathCounter) {
      breathCounter.textContent = `${breathConfig.inhale}-${breathConfig.hold}-${breathConfig.exhale}`;
    }
    
    if (progressBar) {
      progressBar.style.width = '35%';
    }
    
    // Configurar los botones principales
    setupMainButtons();
    
    // Arreglar botones específicos y agregar tooltips
    fixSpecificButtons();
    addTooltipsToButtons();
    
    // Último intento de arreglo - ejecutar después de un tiempo
    setTimeout(() => {
      checkAndFixPanels();
      fixSpecificButtons();
    }, 1000);
    
  } catch (error) {
    console.error("Error en inicialización:", error);
    // Intentar arreglar lo más posible a pesar del error
    try {
      checkAndFixPanels();
      setupMainButtons();
      fixSpecificButtons();
    } catch (emergencyError) {
      console.error("Error crítico durante recuperación:", emergencyError);
      showNotification("Ocurrió un error. Por favor, actualiza la página.");
    }
  }
}

// Asegurarse que el código se ejecute después de cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Si el DOM ya está cargado, ejecutar de inmediato
  init();
}