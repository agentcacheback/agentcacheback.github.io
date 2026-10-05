const $ = id => document.getElementById(id);
const host = window.frameElement;
if (host) {
  document.body.classList.add('embedded');
  const main = document.querySelector('main');
  new ResizeObserver(() => {
    const margin = parseFloat(getComputedStyle(main).marginBottom);
    host.style.height = `${Math.ceil(main.offsetTop + main.offsetHeight + margin) + 1}px`;
  }).observe(main);
}

let trace, playing = false, frame;
const phases = {rclc:0, text:0};
const cards = {rclc:[], text:[]};
const titles = ['Booking confirmation', 'Location-change notice', 'ID policy'];
const question = 'Where should Maya collect her pass on Friday, and what ID should she bring?';
const reviewedAnswer = 'Maya should collect her pass at **Harbour Hub** on Friday, and she should bring a **passport** as her ID.\n\n**Evidence:**\n- "Reference J7 has moved to Harbour Hub."\n- "Harbour Hub requires a passport for replacement building pass collections."';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function segments(source, indices) {
  const chars = Array.from(source.text), mask = Array(chars.length).fill(false);
  for (const index of indices) {
    const [start, end] = source.offsets[index];
    for (let i = start; i < end; i++) mask[i] = true;
  }
  const result = [];
  for (let start = 0; start < chars.length;) {
    let end = start + 1;
    while (end < chars.length && mask[end] === mask[start]) end++;
    result.push({text:chars.slice(start, end).join(''), selected:mask[start]});
    start = end;
  }
  return result;
}

function prose(container, text, fraction = 1) {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g).map(part => {
    const bold = part.startsWith('**') && part.endsWith('**');
    return {bold, chars:Array.from(bold ? part.slice(2, -2) : part)};
  });
  let remaining = Math.floor(parts.reduce((n, part) => n + part.chars.length, 0) * Math.min(1, Math.max(0, fraction)));
  if (container.dataset.characters === String(remaining)) return;
  container.dataset.characters = String(remaining); container.replaceChildren();
  for (const part of parts) {
    const chars = part.chars.slice(0, remaining); remaining -= chars.length;
    if (chars.length) container.append(element(part.bold ? 'strong' : 'span', chars.join('')));
  }
}

function positionMap(source) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('position-map');
  svg.setAttribute('viewBox', `0 0 ${source.offsets.length} 6`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Source positions; teal positions are selected');
  source.offsets.forEach((_, i) => {
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', i); rect.setAttribute('y', 0);
    rect.setAttribute('width', '.8'); rect.setAttribute('height', '6');
    svg.append(rect);
  });
  return svg;
}

function makeCards(method) {
  for (let i = 0; i < 4; i++) {
    const answer = i === 3, source = method === 'rclc' && !answer;
    const card = element('div', undefined, `chunk ${answer ? 'answer message-card' : source ? 'source' : 'message-card'}`);
    card.setAttribute('aria-label', answer ? `${method === 'rclc' ? 'CacheBack' : 'Text'} final answer` : source ? `Full source document ${i + 1}: ${titles[i]}` : `Generated message from Agent ${i + 1}`);
    const title = element('p', answer ? 'Final answer' : source ? titles[i] : `Agent ${i + 1}’s message`, 'source-title');
    if (source) title.append(element('span', `Agent ${i + 1}`));
    card.append(title);
    const badge = element('p', '', 'answer-check'); badge.hidden = true;
    if (answer) card.append(badge);
    const body = element('div', undefined, source ? 'document-body' : 'message-body');
    body.tabIndex = 0; card.append(body);
    let map, handoff, label;
    if (source) { map = positionMap(trace.sources[i]); card.append(map); }
    if (!answer) {
      handoff = element('div', undefined, 'handoff');
      label = element('span', 'Waiting'); handoff.append(label);
      const track = element('div', undefined, 'handoff-track'); track.setAttribute('aria-hidden', 'true');
      if (source) {
        const packet = element('div', undefined, 'packet');
        for (let n = 0; n < 4; n++) packet.append(element('i'));
        track.append(packet);
      }
      handoff.append(track); card.append(handoff);
    }
    if (source) card.prepend(map, handoff);
    $(`${method}-row`).append(card);
    cards[method].push({card, body, map, badge, label});
  }
}

function render(method) {
  const phase = phases[method], recorded = trace.cases[0];
  const selected = trace.sources.map(() => []);
  if (method === 'rclc' && (playing || phase)) {
    // Reveal the recorded target selection during each handoff's playback interval.
    const hop = playing && phase < 3 ? phase : Math.min(phase, 3) - 1;
    for (const [source, token] of recorded.rclc.hops[hop].origins) selected[source].push(token);
  }
  cards[method].forEach(({card, body, map, badge, label}, i) => {
    const active = playing && phase === i, passed = phase > i;
    card.classList.toggle('is-selecting', method === 'rclc' && i < 3 && active);
    card.classList.toggle('is-writing', active && (method === 'text' || i === 3));
    card.classList.toggle('has-passed', passed);
    if (method === 'rclc' && i < 3) {
      card.style.setProperty('--selection-duration', `${recorded.rclc.hops[i].seconds / Number($('speed').value)}s`);
      const scroll = body.scrollTop;
      body.replaceChildren(...segments(trace.sources[i], selected[i]).map(piece => element(piece.selected ? 'mark' : 'span', piece.text)));
      body.scrollTop = scroll;
      const indices = new Set(selected[i]);
      [...map.children].forEach((rect, n) => rect.classList.toggle('selected', indices.has(n)));
      label.textContent = passed ? 'Selected state passed' : active ? 'Selecting positions' : 'Full source document';
    } else {
      delete body.dataset.characters;
      if (passed) {
        const message = i === 3 ? recorded[method].answer : recorded.text.hops[i].message;
        prose(body, message.text || '(empty message)');
        body.scrollTop = 0;
      } else {
        body.replaceChildren();
        if (!active) {
          const dots = element('div', undefined, 'waiting-state'); dots.setAttribute('aria-hidden', 'true');
          for (let n = 0; n < 3; n++) dots.append(element('i'));
          body.append(dots, element('p', i === 3 ? 'Waiting for the handoffs.' : 'Waiting to generate a message.', 'placeholder'));
        }
      }
      if (label) label.textContent = passed ? 'Message passed' : active ? 'Generating message' : 'Waiting';
    }
    if (i === 3) {
      const done = phase === 4, reviewed = recorded.question === question;
      card.classList.toggle('complete', done && method === 'rclc');
      const unresolved = done && reviewed && method === 'text' && recorded.text.answer.text.startsWith('Maya should collect her pass at the assigned desk based on her reference J7');
      card.classList.toggle('unresolved', unresolved);
      badge.hidden = true;
      if (done && reviewed && method === 'rclc' && recorded.rclc.answer.text === reviewedAnswer) {
        badge.textContent = '✓ Harbour Hub · Passport'; badge.hidden = false;
      } else if (unresolved) {
        badge.textContent = 'Collection desk unresolved'; badge.hidden = false;
      }
    }
  });
  const activity = $(`${method}-activity`);
  activity.textContent = phase === 4 ? 'Finished' : playing ? phase === 3 ? 'Generating answer' : method === 'rclc' ? 'Selecting & passing' : 'Generating message' : 'Ready';
  activity.classList.toggle('running', playing && phase < 4);
  activity.classList.toggle('complete', phase === 4);
  $(`${method}-time`).textContent = phase === 4 ? `${recorded[method].seconds.toFixed(2)} s` : '0.00 s';
  if (method === 'rclc') document.querySelectorAll('.topology li').forEach((node, i) => node.classList.toggle('reached', phase > i));
  $('status').textContent = `${method === 'rclc' ? 'CacheBack' : 'Text'}: ${phase === 4 ? 'final answer received.' : `${phase} of 3 handoffs received.`}`;
}

function reset() {
  cancelAnimationFrame(frame); playing = false;
  for (const method of ['rclc', 'text']) {
    phases[method] = 0; render(method);
    cards[method].forEach(({body}) => { body.scrollTop = 0; });
  }
  $('play').disabled = $('speed').disabled = false;
  $('play').textContent = 'Run ▶'; $('clear').hidden = true;
}

function play() {
  if (playing || !trace) return;
  reset(); playing = true; $('play').disabled = $('speed').disabled = true;
  $('play').textContent = 'Running';
  $('clear').hidden = false;
  const speed = Number($('speed').value), deadlines = {};
  for (const method of ['rclc', 'text']) {
    let elapsed = 0;
    const run = trace.cases[0][method];
    deadlines[method] = [...run.hops.map(hop => elapsed += hop.seconds * 1000), run.seconds * 1000];
    render(method);
  }
  let start;
  function advance(now) {
    start ??= now;
    const elapsed = (now - start) * speed;
    for (const method of ['rclc', 'text']) {
      const phase = deadlines[method].filter(ms => elapsed >= ms).length;
      if (phase !== phases[method]) { phases[method] = phase; render(method); }
      if (phase < 4) {
        $(`${method}-time`).textContent = `${(elapsed / 1000).toFixed(2)} s`;
        if (method === 'text' || phase === 3) {
          const begin = phase ? deadlines[method][phase - 1] : 0;
          const message = phase === 3 ? trace.cases[0][method].answer : trace.cases[0].text.hops[phase].message;
          const body = cards[method][phase].body;
          prose(body, message.text, (elapsed - begin) / (deadlines[method][phase] - begin));
          body.scrollTop = body.scrollHeight;
        }
      }
    }
    if (phases.rclc < 4 || phases.text < 4) frame = requestAnimationFrame(advance);
    else {
      playing = false; $('play').disabled = $('speed').disabled = false;
      $('play').textContent = 'Replay';
    }
  }
  frame = requestAnimationFrame(advance);
}

$('play').addEventListener('click', play);
$('clear').addEventListener('click', () => { reset(); $('play').focus(); });
$('speed').addEventListener('change', () => {
  $('timing-note').textContent = `${$('speed').value === '1' ? '' : `Playback ${$('speed').value}×. `}Measured times; selection and streaming animated for playback.`;
});

async function load() {
  try {
    const response = await fetch('trace-w4.json');
    if (!response.ok) throw new Error(`Recording unavailable (${response.status}).`);
    trace = await response.json();
    if (trace.schema !== 2 || trace.span_size !== 4 || trace.sources.length !== 3 || !trace.cases.length) throw new Error('Expected a W=4 three-handoff recording.');
    $('question').textContent = trace.cases[0].question;
    const hardware = trace.run.device.startsWith('cuda') ? trace.run.gpu.replace('NVIDIA ', '') : 'CPU';
    $('run-info').textContent = `Recorded ${trace.run.model.split('/').pop()} · ${hardware} · r${trace.ratio} · W=4${trace.complete === false ? ' · Partial recording' : ''}`;
    for (const method of ['rclc', 'text']) { makeCards(method); render(method); }
    $('play').disabled = $('speed').disabled = false;
  } catch (error) {
    $('error').hidden = false;
    $('error').textContent = `${error.message} Serve this folder with python -m http.server.`;
  }
}
load();
