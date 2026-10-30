// Teste de UI no navegador real: node scripts/check-ui.mjs (ou npm run test:ui).
// Valida: título da tela 2, ausência de rolagem, trilha e bolinhas de subtela clicáveis (só para trás) e posição dos campos.
// Usa o Chrome instalado (CHROME_PATH para outro caminho) e sobe o próprio servidor do Vite.
import assert from 'node:assert/strict'
import puppeteer from 'puppeteer-core'
import { createServer } from 'vite'
import { mineBlock } from '../src/core/Block.js'

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const server = await createServer({ server: { port: 5199 }, logLevel: 'silent' })
await server.listen()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })

const noScroll = (page, label, horizontalOnly = false) =>
  page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight, innerWidth, innerHeight]).then(([sw, sh, w, h]) => {
    assert.ok(sw <= w, `${label}: rolagem horizontal (${sw} > ${w})`)
    if (!horizontalOnly) assert.ok(sh <= h, `${label}: rolagem vertical (${sh} > ${h})`)
  })
const box = (page, sel) => page.$eval(sel, (el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right } })
const dot = (i, n) => `ol[aria-label="Partes da etapa"] button[aria-label="Parte ${i} de ${n}"]`
const enabled = (page, n) => page.$eval(`ol button[aria-label^="Etapa ${n}"]`, (b) => !b.disabled)

// reduce=true torna a digitação instantânea (rápido); reduce=false roda com animações reais
async function run(width, height, reduce = true) {
  const tag = `${width}x${height}`
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto('http://localhost:5199')

  // Home responsiva
  await page.waitForSelector('main button')
  await noScroll(page, `home ${tag}`, height > 700 && width < 700)
  await page.click('main button')

  // Correção 1: título igual ao do Figma
  await page.waitForFunction(() => document.querySelector('h1[aria-label], h1 [aria-label]'))
  assert.equal(await page.$eval('h1 [aria-label]', (e) => e.getAttribute('aria-label')), 'Transação e Blocos', `título ${tag}`)
  await page.waitForFunction(() => { const i = document.querySelector('input'); return i && !i.closest('[inert]') })
  const mobile = width < 1024
  await noScroll(page, `tela 2 ${tag}`, mobile)

  // Correção 3: só a etapa 1 liberada
  assert.ok(await enabled(page, 1))
  for (const n of [2, 3, 4]) assert.ok(!(await enabled(page, n)), `etapa ${n} deveria estar bloqueada ${tag}`)

  // Subtelas da etapa 1: só a introdução liberada no começo
  assert.equal((await page.$$('ol[aria-label="Partes da etapa"] button')).length, 3)
  assert.ok(!(await page.$eval(dot(1, 3), (b) => b.disabled)) && (await page.$eval(dot(2, 3), (b) => b.disabled)) && (await page.$eval(dot(3, 3), (b) => b.disabled)), `bolinhas bloqueadas no começo ${tag}`)

  // Trilha igual ao Figma: círculos de 32px, ligações de 45px, nada esmaecido
  const trailLook = await page.$$eval('ol[aria-label="Etapas da simulação"] > li > button', (bs) => bs.map((x) => { const r = x.getBoundingClientRect(); return [r.width, getComputedStyle(x).opacity, getComputedStyle(x).fontWeight] }))
  for (const [w, opacity, weight] of trailLook) assert.ok(w === 32 && opacity === '1' && weight === '400', `trilha fora do design do Figma ${tag}`)
  assert.equal(await page.$eval('ol li[aria-hidden] img', (i) => i.getBoundingClientRect().width), 45, `ligação da trilha deve ter 45px ${tag}`)

  if (!mobile) {
    const title = await box(page, 'h1'), trail = await box(page, 'ol'), block = await box(page, '[data-testid=candidate-block]')
    const mid = (b) => (b.top + b.bottom) / 2
    // trilha na altura do título e centralizada na coluna da direita
    assert.ok(Math.abs(mid(title) - mid(trail)) < 30, `trilha fora da altura do título ${tag}`)
    assert.ok(trail.right < width - 48 && trail.left > width / 2, `trilha não centralizada na coluna direita ${tag}`)
    // blocos grandes (ocupam o espaço) e com margem em relação ao rodapé
    assert.ok(block.bottom - block.top >= height * 0.38, `bloco pequeno demais ${tag}`)
    assert.ok(height - block.bottom >= height * 0.04, `bloco colado no rodapé ${tag}`)
    // campos: centro horizontal entre o bloco e a lateral direita; vertical entre o meio da tela e o rodapé
    const form = await box(page, 'form')
    assert.ok(Math.abs((form.left + form.right) / 2 - (block.right + width) / 2) < 40, `campos fora do centro entre bloco e lateral ${tag}`)
    assert.ok(Math.abs(mid(form) - height * 0.75) < height * 0.06, `campos fora do centro entre o meio da tela e o rodapé ${tag}`)
    assert.ok(width - form.right >= 24 && height - form.bottom >= height * 0.05, `campos perto demais das bordas ${tag} (direita ${width - form.right}, baixo ${height - form.bottom})`)
  }

  // Fluxo: preencher, enviar, voltar e invalidar
  await page.type('input[name=from]', 'Alice'); await page.type('input[name=amount]', '50'); await page.type('input[name=to]', 'Bob')
  await page.waitForFunction(() => { const b = document.querySelector('button[type=submit]'); return b && !b.closest('[inert]') })
  assert.ok(!(await page.$eval(dot(2, 3), (b) => b.disabled)) && (await page.$eval(dot(3, 3), (b) => b.disabled)), `bolinha 2 liberada ao preencher ${tag}`)
  await noScroll(page, `preenchida ${tag}`, mobile)
  await page.click('button[type=submit]')
  await page.waitForFunction(() => document.querySelector('[data-testid=candidate-block] dl'))
  await noScroll(page, `enviada ${tag}`, mobile)
  assert.ok(await enabled(page, 2) && !(await enabled(page, 3)), `após enviar: 2 liberada, 3 bloqueada ${tag}`)
  assert.ok(!(await page.$eval(dot(3, 3), (b) => b.disabled)) && (await page.$eval(dot(3, 3), (b) => b.getAttribute('aria-current'))) === 'step', `bolinha 3 atual após enviar ${tag}`)

  // Dados lado a lado, sem caixa estática; contorno pontilhado e animado
  const tops = await page.$$eval('[data-testid=candidate-block] dt', (els) => els.map((e) => [e.getBoundingClientRect().top, e.getBoundingClientRect().left]))
  assert.equal(tops.length, 3)
  if (!mobile) assert.ok(tops.every(([t], i) => Math.abs(t - tops[0][0]) < 4 && (i === 0 || tops[i][1] > tops[i - 1][1])), `dados devem ficar lado a lado ${tag}`)
  assert.equal(await page.$eval('[data-testid=candidate-block] dl', (e) => getComputedStyle(e).borderTopWidth), '0px', 'dados não devem ter borda estática')
  assert.equal(await page.$eval('[data-testid=candidate-block] svg rect', (e) => getComputedStyle(e).strokeDasharray), '8px, 8px', 'contorno deve ser pontilhado')
  const off = () => page.$eval('[data-testid=candidate-block] svg rect', (e) => getComputedStyle(e).strokeDashoffset)
  if (!reduce) {
    const o1 = await off(); await new Promise((r) => setTimeout(r, 300)); assert.notEqual(o1, await off(), 'contorno pontilhado deve animar')
  }

  // Bolinhas: voltar à subtela 2 reabre o formulário e tira a transação do bloco; a 3 a devolve
  await page.click(dot(2, 3))
  await page.waitForSelector('input[name=from]')
  assert.equal(await page.$('[data-testid=candidate-block] dl'), null, 'voltar à subtela 2 tira a transação do bloco')
  assert.ok(await enabled(page, 2), `etapa 2 segue liberada ao voltar ${tag}`)
  await page.click(dot(1, 3))
  await page.waitForFunction(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('livro-razão digital'))
  await page.click(dot(3, 3))
  await page.waitForFunction(() => document.querySelector('[data-testid=candidate-block] dl'))

  // Continuar leva à etapa 2; a trilha volta à etapa 2 com a transação e o botão intactos
  const cont = () => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Continuar' && !b.closest('[inert]'))
  await page.waitForFunction(cont)
  await noScroll(page, `continuar ${tag}`, mobile)
  const btnBox = (text) => page.evaluate((t) => { const r = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t).getBoundingClientRect(); return { right: r.right, mid: (r.top + r.bottom) / 2 } }, text)
  const continuarBox = await btnBox('Continuar')
  // A trilha é uma só: o mesmo elemento, na mesma posição e visível em todas as telas
  const trailBox = () => page.$eval('ol', (o) => { const r = o.getBoundingClientRect(); return { left: r.left, top: r.top, same: o === window.__trail, shown: getComputedStyle(o.parentElement).opacity } })
  await page.evaluate(() => { window.__trail = document.querySelector('ol') })
  const trail2 = await trailBox()
  const sameTrail = async (label) => { const t = await trailBox(); assert.ok(t.same, `trilha remontada em ${label} ${tag}`); assert.ok(Math.abs(t.left - trail2.left) <= 1 && Math.abs(t.top - trail2.top) <= 1, `trilha mudou de posição em ${label} ${tag}`); assert.equal(t.shown, '1') }
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent === 'Continuar').click())
  await page.waitForFunction(() => document.querySelector('h1 [aria-label="Geração de Hash"]'))
  await sameTrail('hash')
  assert.ok(await enabled(page, 2) && !(await enabled(page, 3)), `etapa 3 só abre após o Próximo ${tag}`)

  // Tela de Hashing: campos com a transação, "Alterar" só ao digitar, hash refeito, texto trocado e "Próximo" no fim
  const visible = (text) => page.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === t && !b.closest('[inert]')), {}, text)
  const hidden = (text) => page.evaluate((t) => ![...document.querySelectorAll('button')].some((b) => b.textContent.trim() === t && !b.closest('[inert]')), text)
  const click = (text) => page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t).click(), text)
  const hash = () => page.$eval('[data-testid=hash]', (e) => e.dataset.hash)
  const explanation = () => page.$eval('main p > span[aria-label]', (e) => e.getAttribute('aria-label'))
  await page.waitForFunction(() => { const i = document.querySelector('input'); return i && !i.closest('[inert]') && document.querySelector('[data-testid=hash]').dataset.hash.length === 64 })
  await noScroll(page, `hashing ${tag}`, mobile)
  assert.deepEqual(await page.$$eval('input', (is) => is.map((i) => i.value)), ['Alice', '50', 'Bob'], `campos com a transação anterior ${tag}`)
  assert.ok(await hidden('Alterar') && await hidden('Próximo'), `Alterar e Próximo começam ocultos ${tag}`)
  const h0 = await hash()
  await page.type('input[name=from]', 'x')
  await visible('Alterar')
  assert.equal(await hash(), h0, 'digitar não muda o hash; só o botão Alterar')
  await click('Alterar')
  await page.waitForFunction((h) => document.querySelector('[data-testid=hash]').dataset.hash !== h, {}, h0)
  assert.equal((await hash()).length, 64)
  await page.waitForFunction(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('completamente diferente'))
  await visible('Próximo')
  assert.ok(!(await page.$eval(dot(2, 2), (b) => b.disabled)), `bolinha do resultado liberada ${tag}`)
  assert.ok(await hidden('Alterar'), 'Alterar some depois de aplicar')
  await noScroll(page, `hashing alterado ${tag}`, mobile)
  if (!mobile) {
    // Próximo: borda direita dos campos, centro na altura do hash e na mesma posição do Continuar
    const prox = await btnBox('Próximo'), fields = await box(page, 'input[name=to]'), hashBox = await box(page, '[data-testid=hash]')
    assert.ok(Math.abs(prox.right - fields.right) <= 1, `Próximo desalinhado dos campos ${tag}`)
    assert.ok(Math.abs(prox.mid - (hashBox.top + hashBox.bottom) / 2) <= 2, `Próximo fora do centro do hash ${tag}`)
    assert.ok(Math.abs(prox.mid - continuarBox.mid) <= 1, `Continuar e Próximo em alturas diferentes ${tag}`)
    assert.ok(Math.abs(prox.right - continuarBox.right) <= 1, `Continuar e Próximo em posições diferentes ${tag}`)
    assert.ok(height - prox.mid >= height * 0.07, `Próximo colado no rodapé ${tag}`)
  }
  // Bolinhas da etapa 2: voltar à introdução e ao resultado, sem esconder o Próximo
  await page.click(dot(1, 2))
  await page.waitForFunction(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('Experimente'))
  await visible('Próximo')
  await page.click(dot(2, 2))
  await page.waitForFunction(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('completamente diferente'))
  await page.focus('input[name=from]'); await page.keyboard.press('Backspace') // devolve o dado original
  await visible('Alterar'); await click('Alterar')
  await page.waitForFunction((h) => document.querySelector('[data-testid=hash]').dataset.hash === h, {}, h0)
  await page.waitForFunction(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('exatamente o mesmo'))
  assert.ok(!(await explanation()).includes('completamente diferente'), 'texto trocado de novo')
  await visible('Próximo')
  await click('Próximo')
  await page.waitForFunction(() => document.querySelector('h1 [aria-label="Proof of Work"]'))
  await sameTrail('mineração')
  assert.ok(await enabled(page, 3) && !(await enabled(page, 4)), `etapa 3 liberada após Próximo ${tag}`)

  // Proof of Work: a mineração só começa com a escolha da dificuldade; roleta por posição, travamento e Próximo no fim
  const pause = (ms) => new Promise((r) => setTimeout(r, ms))
  const hashAttr = (name) => page.$eval('[data-testid=hash]', (e, n) => e.dataset[n], name)
  const diffBtn = (n) => `button[aria-label^="Dificuldade ${n}"]`
  const wait = (fn, ...args) => page.waitForFunction(fn, {}, ...args)
  const diff = reduce ? 1 : 2
  const expected = await mineBlock({ from: 'Alice', amount: 50, to: 'Bob' }, diff)
  await wait((s) => { const b = document.querySelector(s); return b && !b.closest('[inert]') }, diffBtn(1))
  await noScroll(page, `pow texto 1 ${tag}`, mobile)
  assert.equal(await hashAttr('state'), 'idle', `a mineração só começa depois da escolha ${tag}`)
  assert.ok(await hidden('Próximo'))
  assert.ok((await page.$eval(dot(2, 3), (b) => b.disabled)) && (await page.$eval(dot(3, 3), (b) => b.disabled)), `bolinhas bloqueadas antes da escolha ${tag}`)
  await page.click(diffBtn(diff))
  assert.ok(await page.$eval(diffBtn(1 + (diff % 3)), (b) => b.disabled), `seletor desabilitado após a escolha ${tag}`)
  assert.equal(await page.$eval(diffBtn(diff), (b) => b.getAttribute('aria-pressed')), 'true')
  await wait((d) => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes(`dificuldade ${d}`), diff)
  await noScroll(page, `pow texto da dificuldade ${tag}`, mobile)
  if (!reduce) {
    await wait(() => document.querySelector('[data-testid=hash]').dataset.state === 'spinning')
    const n1 = Number(await page.$eval('[data-testid=nonce]', (e) => e.textContent))
    const snaps = []
    for (let i = 0; i < 30; i++) { snaps.push(await hashAttr('hash')); await pause(20) }
    const changes = snaps.slice(1).map((s, i) => [...s].filter((c, j) => c !== snaps[i][j]).length)
    assert.ok(changes.some((c) => c > 0 && c < 60) && changes.every((c) => c < 64), `posições do hash devem girar em instantes diferentes ${tag}`)
    assert.ok(Number(await page.$eval('[data-testid=nonce]', (e) => e.textContent)) > n1, `nonce deve subir durante a mineração ${tag}`)
    assert.ok(await hidden('Próximo'), `Próximo oculto durante a mineração ${tag}`)
  }
  if (!reduce) {
    await wait(() => document.querySelector('[data-testid=hash]').dataset.state === 'locking')
    const locks = []
    while ((await hashAttr('state')) === 'locking') { locks.push(await page.$eval('[data-testid=hash]', (e) => [Number(e.dataset.locked), e.dataset.hash])); await pause(30) }
    for (const [n, h] of locks) assert.equal(h.slice(0, n), expected.hash.slice(0, n), `posições travadas devem ter o valor final ${tag}`)
    assert.ok(locks.some(([n]) => n > 0 && n < 64) && locks.every(([n], i) => i === 0 || n >= locks[i - 1][0]), `travamento da esquerda para a direita ${tag}`)
  }
  await wait(() => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes('Observe o nonce'))
  await noScroll(page, `pow texto 2 ${tag}`, mobile)
  await wait(() => document.querySelector('[data-testid=hash]').dataset.state === 'done')
  assert.equal(await hashAttr('hash'), expected.hash, `hash final é o do laço real ${tag}`)
  assert.ok(expected.hash.startsWith('0'.repeat(diff)))
  assert.equal(await page.$eval('[data-testid=nonce]', (e) => e.textContent), String(expected.nonce), `nonce final ${tag}`)
  assert.equal(await page.$eval('[data-testid=candidate-block]', (e) => e.dataset.solved), 'true')
  await visible('Próximo')
  await noScroll(page, `pow resolvido ${tag}`, mobile)

  // Bolinhas da mineração: reler os textos não refaz a mineração nem esconde o Próximo
  const said = (part) => wait((t) => document.querySelector('main p > span[aria-label]').getAttribute('aria-label').includes(t), part)
  await page.click(dot(1, 3)); await said('O primeiro passo')
  assert.equal(await hashAttr('state'), 'done', `reler a introdução não refaz a mineração ${tag}`)
  await page.click(dot(2, 3)); await said(`dificuldade ${diff}`)
  assert.equal(await hashAttr('state'), 'done')
  await page.click(dot(3, 3)); await said('Observe o nonce')
  await visible('Próximo')

  // Próximo leva à etapa 4 (esqueleto de Imutabilidade); voltar pela trilha mantém o resultado e libera o Próximo na hora
  await click('Próximo')
  await page.waitForFunction(() => document.querySelector('h1 [aria-label="Imutabilidade"]'))
  await sameTrail('imutabilidade')
  assert.ok(await enabled(page, 4))
  await page.click('ol button[aria-label="Etapa 3"]')
  await page.waitForFunction(() => document.querySelector('h1 [aria-label="Proof of Work"]'))
  await wait(() => document.querySelector('[data-testid=hash]').dataset.state === 'done')
  assert.equal(await hashAttr('hash'), expected.hash, `resultado mantido ao voltar ${tag}`)
  assert.ok(await page.$eval(diffBtn(diff), (b) => b.disabled && b.getAttribute('aria-pressed') === 'true'), `dificuldade mantida ao voltar ${tag}`)
  await visible('Próximo')

  await page.click('ol button[aria-label="Etapa 2"]')
  await page.waitForFunction(() => document.querySelector('h1 [aria-label="Geração de Hash"]'))

  await page.click('ol button[aria-label="Etapa 1"]')
  await page.waitForSelector('input[name=from]')
  assert.equal(await page.$eval('input[name=from]', (i) => i.value), 'Alice', `dados mantidos ao voltar de outra tela ${tag}`)
  await page.type('input[name=from]', 'x') // editar invalida a etapa 2
  assert.ok(!(await enabled(page, 2)), `editar um campo deve bloquear a etapa 2 ${tag}`)
  await page.close()
  console.log(`ok ${tag}`)
}

try {
  for (const [w, h, reduce] of [[1280, 720], [1366, 768], [1920, 1080, false], [375, 800]]) await run(w, h, reduce)
  console.log('Todas as verificações passaram')
} catch (e) {
  console.error('FALHOU:', e.stack.split('\n').slice(0, 4).join('\n'))
  process.exitCode = 1
} finally {
  await browser.close()
  await server.close()
}
