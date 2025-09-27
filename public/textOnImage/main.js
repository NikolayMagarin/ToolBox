document.getElementById('year').textContent = new Date().getFullYear();

const container = document.getElementById('preview-container');
const textBox = document.getElementById('text-box');
const inputImg = document.getElementById('input-image');
const textSizeInput = document.getElementById('text-size-input');
const textSizeInputValue = document.getElementById('text-size-input-value');
const textBoxWidthInput = document.getElementById('text-box-size-input');
const textBoxWidthInputValue = document.getElementById(
  'text-box-size-input-value'
);
const textLineHeightInput = document.getElementById('text-line-height-input');
const textLineHeightInputValue = document.getElementById(
  'text-line-height-input-value'
);
const image = document.getElementById('image');
const hint = document.getElementById('hint');
const inputText = document.getElementById('input-text');
const colorInput = document.getElementById('color-input');
const fontFamilySelect = document.getElementById('font-family-select');
const bTextCheckbox = document.getElementById('bold-text-checkbox');
const iTextCheckbox = document.getElementById('italic-text-checkbox');
const uTextCheckbox = document.getElementById('underline-text-checkbox');
const sTextCheckbox = document.getElementById('strikethrough-text-checkbox');
const downloadBtn = document.getElementById('download-btn');

const saveSettingsDebounced = debounce(saveSettings, 250);

inputImg.onchange = () => {
  const file = inputImg.files[0];

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.onload = function (e) {
      image.onload = function () {
        const originalWidth = image.naturalWidth;
        const originalHeigth = image.naturalHeight;
        container.style.width = `${originalWidth}px`;
        container.style.height = `${originalHeigth}px`;

        function resize() {
          const scale =
            Math.min(1000, document.body.clientWidth - 20) / originalWidth;
          hint.innerHTML = `Размер изображения: ${originalWidth}px &times; ${originalHeigth}px<br>Предпросмотр в масштабе <b>${Math.round(
            scale * 100
          )}%</b>`;
          container.style.marginLeft = `${
            (document.body.clientWidth - 20 - scale * originalWidth) / 2
          }px`;
          container.style.width = `${originalWidth * scale}px`;
          container.style.height = `${originalHeigth * scale}px`;
          textBox.style.setProperty('--text-scale', scale.toString());
        }

        window.onresize = resize;
        resize();

        image.classList.add('img-loaded');
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

let tooltipLearned = false;

textBox.style.fontSize = `calc(${textSizeInput.value}px * var(--text-scale))`;
textSizeInputValue.innerText = (+textSizeInput.value).toFixed(1);
textSizeInput.oninput = () => {
  textSizeInputValue.innerText = (+textSizeInput.value).toFixed(1);
  textBox.style.fontSize = `calc(${textSizeInput.value}px * var(--text-scale))`;
  saveSettingsDebounced();

  if (
    !tooltipLearned &&
    textSizeInput.value === textSizeInput.getAttribute('max')
  ) {
    const hideTooltip = createTooltip(
      textSizeInputValue,
      'Изменить макс. размер'
    );
    if (hideTooltip) {
      const hideOnClick = () => {
        hideTooltip();
        textSizeInputValue.removeEventListener('click', hideOnClick);
        tooltipLearned = true;
      };
      textSizeInputValue.addEventListener('click', hideOnClick);
    }
  }
};

textBox.style.lineHeight = textLineHeightInput.value;
textLineHeightInputValue.innerText = (+textLineHeightInput.value).toFixed(2);
textLineHeightInput.oninput = () => {
  textLineHeightInputValue.innerText = (+textLineHeightInput.value).toFixed(2);
  textBox.style.lineHeight = textLineHeightInput.value;
  saveSettingsDebounced();
};

textBox.style.width = `${textBoxWidthInput.value}%`;
textBoxWidthInputValue.innerText = textBoxWidthInput.value;
textBoxWidthInput.oninput = () => {
  textBoxWidthInputValue.innerText = textBoxWidthInput.value;
  textBox.style.width = `${textBoxWidthInput.value}%`;
  saveSettingsDebounced();
};

inputImg.ondragover = () => {
  inputImg.parentNode.className = 'draging image-dragBox';
};
inputImg.ondrop = () => {
  inputImg.parentNode.className = 'image-dragBox';
};

textSizeInputValue.onclick = () => {
  let maxSize = parseInt(textSizeInput.getAttribute('max'));

  if (maxSize >= 256) {
    maxSize = 64;
  } else {
    maxSize *= 2;
  }

  textSizeInput.setAttribute('max', maxSize.toString());
  textSizeInput.value = maxSize;
  textSizeInputValue.innerText = maxSize % 1 === 0 ? maxSize + '.0' : maxSize;
  textBox.style.fontSize = `calc(${maxSize}px * var(--text-scale))`;
};

inputText.oninput = () => {
  inputText.style.height = `0px`;
  inputText.style.height = `${inputText.scrollHeight}px`;
  inputText.style.overflow =
    inputText.scrollHeight - inputText.clientHeight > 10 ? 'visible' : 'hidden';

  textBox.textContent = inputText.value;

  saveSettingsDebounced();
};

document.querySelectorAll('input[name="text-align"]').forEach((el) => {
  el.oninput = (e) => {
    textBox.style.textAlign = e.target.value;
    saveSettingsDebounced();
  };
});

colorInput.setAttribute(
  'data-jscolor',
  JSON.stringify({
    backgroundColor: 'var(--surface-color)',
    borderColor: '#444',
    borderRadius: 8,
    controlBorderColor: '#444',
    crossSize: 4,
    format: 'any',
    pointerBorderWidth: 0,
    position: 'top',
    shadowColor: 'var(--primary-color)',
    shadowBlur: 2,
    value: '#000',
  })
);

colorInput.oninput = () => {
  textBox.style.color = colorInput.value;
  saveSettingsDebounced();
};

fontFamilySelect.oninput = () => {
  textBox.style.fontFamily = fontFamilySelect.value;
  saveSettingsDebounced();
};

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Enter' &&
    e.target instanceof HTMLInputElement &&
    e.target.type === 'checkbox'
  ) {
    e.target.click();
  }
});

bTextCheckbox.oninput = (e) => {
  textBox.style.fontWeight = e.target.checked ? 'bold' : 'normal';
  saveSettingsDebounced();
};

iTextCheckbox.oninput = (e) => {
  textBox.style.fontStyle = e.target.checked ? 'italic' : 'normal';
  saveSettingsDebounced();
};

uTextCheckbox.oninput = () => {
  textBox.style.textDecoration =
    [
      uTextCheckbox.checked && 'underline',
      sTextCheckbox.checked && 'line-through',
    ]
      .filter(Boolean)
      .join(' ') || 'none';

  saveSettingsDebounced();
};

sTextCheckbox.oninput = uTextCheckbox.oninput;

function saveSettings() {
  const settings = {};

  settings.text = inputText.value;
  settings.align = textBox.style.textAlign;
  settings.bold = bTextCheckbox.checked;
  settings.italic = iTextCheckbox.checked;
  settings.underline = document.getElementById(
    'underline-text-checkbox'
  ).checked;
  settings.strikethrough = document.getElementById(
    'strikethrough-text-checkbox'
  ).checked;
  settings.color = colorInput.value;
  settings.family = fontFamilySelect.value;
  settings.size = +textSizeInput.value;
  settings.interval = +textLineHeightInput.value;
  settings.width = +textBoxWidthInput.value;

  localStorage.setItem('pictext_settings', JSON.stringify(settings));
}

function debounce(func, ms) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), ms);
  };
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('pictext_settings') || '{}');

  inputText.value = settings.text || '';
  inputText.oninput();

  [...document.querySelectorAll('input[name="text-align"]')]
    .find((e) => e.value === settings.align)
    ?.click();

  if (settings.bold) bTextCheckbox.click();
  if (settings.italic) iTextCheckbox.click();
  if (settings.underline) uTextCheckbox.click();
  if (settings.strikethrough) sTextCheckbox.click();

  jscolor.install();
  colorInput.jscolor.fromString(settings.color || '#000000');
  textBox.style.color = colorInput.value;

  fontFamilySelect.value = settings.family || fontFamilySelect.value;
  textBox.style.fontFamily = fontFamilySelect.value;

  const fontSize = settings.size || 24;
  if (fontSize > 128) {
    textSizeInput.setAttribute('max', '256');
  } else if (fontSize > 64) {
    textSizeInput.setAttribute('max', '128');
  } else {
    textSizeInput.setAttribute('max', '64');
  }
  textSizeInput.value = fontSize.toString();
  textSizeInput.oninput();

  textLineHeightInput.value = settings.interval || '1';
  textLineHeightInput.oninput();

  textBoxWidthInput.value = settings.width || '90';
  textBoxWidthInput.oninput();
}

downloadBtn.onclick = () => {
  container.style.marginLeft = '0px';
  container.style.width = `${image.naturalWidth}px`;
  container.style.height = `${image.naturalHeight}px`;
  textBox.style.setProperty('--text-scale', '1');

  domtoimage
    .toJpeg(container)
    .then(function (dataUrl) {
      window.onresize();

      const anchorElement = document.createElement('a');
      anchorElement.href = dataUrl;
      anchorElement.download = inputImg?.files?.[0].name || 'image';
      anchorElement.click();
    })
    .catch(function (error) {
      console.error(error);
    });
};

loadSettings();

function createTooltip(element, text) {
  if (performance.now() < 500) return null;

  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.textContent = text;

  Object.assign(tooltip.style, {
    position: 'fixed',
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    zIndex: '10000',
    maxWidth: '200px',
    wordWrap: 'break-word',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    transform: 'translateX(-10px)',
    pointerEvents: 'none',
  });

  document.body.appendChild(tooltip);

  function showTooltip() {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    tooltip.style.left =
      rect.left + scrollLeft - tooltip.offsetWidth - 10 + 'px';
    tooltip.style.top =
      rect.top + scrollTop + (rect.height - tooltip.offsetHeight) / 2 + 'px';

    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateX(0)';
    }, 10);

    const autoHideTimer = setTimeout(hideTooltip, 5000);

    function hideTooltip() {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateX(-10px)';

      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        // Удаляем обработчики событий
        document.removeEventListener('click', hideOnClick);
        document.removeEventListener('keydown', hideOnEscape);
        clearTimeout(autoHideTimer);
      }, 300);
    }

    function hideOnClick(event) {
      if (!tooltip.contains(event.target) && event.target !== element) {
        hideTooltip();
      }
    }

    function hideOnEscape(event) {
      if (event.key === 'Escape') {
        hideTooltip();
      }
    }

    document.addEventListener('mousedown', hideOnClick);
    document.addEventListener('keydown', hideOnEscape);

    tooltip._hideTooltip = hideTooltip;
    tooltip._hideOnClick = hideOnClick;
    tooltip._hideOnEscape = hideOnEscape;
    tooltip._autoHideTimer = autoHideTimer;
  }

  function forceHide() {
    if (tooltip._hideTooltip) {
      tooltip._hideTooltip();
    }
  }

  showTooltip();

  return forceHide;
}
