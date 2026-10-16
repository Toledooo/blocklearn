// Teste de UI no navegador real: node scripts/check-ui.mjs (ou npm run test:ui).
// Valida: título da tela 2, ausência de rolagem, trilha clicável (só para trás) e posição dos campos.
// Usa o Chrome instalado (CHROME_PATH para outro caminho) e sobe o próprio servidor do Vite.
import assert from 'node:assert/strict'
import puppeteer from 'puppeteer-core'
import { createServer } from 'vite'

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

  // Trilha igual ao Figma: círculos de 32px, ligações de 45px, nada esmaecido
  const trailLook = await page.$$eval('ol button', (bs) => bs.map((x) => { const r = x.getBoundingClientRect(); return [r.width, getComputedStyle(x).opacity, getComputedStyle(x).fontWeight] }))
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
  await noScroll(page, `preenchida ${tag}`, mobile)
  await page.click('button[type=submit]')
  await page.waitForFunction(() => document.querySelector('[data-testid=candidate-block] dl'))
  await noScroll(page, `enviada ${tag}`, mobile)
  assert.ok(await enabled(page, 2) && !(await enabled(page, 3)), `após enviar: 2 liberada, 3 bloqueada ${tag}`)

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

  await page.click('ol button[aria-label="Etapa 1"]')
  await page.waitForSelector('input[name=from]')
  assert.equal(await page.$('[data-testid=candidate-block] dl'), null, 'voltar à etapa 1 tira a transação do bloco')
  assert.ok(await enabled(page, 2), `etapa 2 segue liberada ao voltar ${tag}`)
  await page.click('ol button[aria-label="Etapa 2"]')
  await page.waitForFunction(() => document.querySelector('[data-testid=candidate-block] dl'))

  await page.click('ol button[aria-label="Etapa 1"]')
  await page.waitForSelector('input[name=from]')
  await page.type('input[name=from]', 'x') // editar invalida a etapa 2
  assert.ok(!(await enabled(page, 2)), `editar um campo deve bloquear a etapa 2 ${tag}`)
  await page.close()
  console.log(`ok ${tag}`)
}

try {
  for (const [w, h, reduce] of [[1280, 720], [1366, 768], [1920, 1080, false], [375, 800]]) await run(w, h, reduce)
  console.log('Todas as verificações passaram')
} catch (e) {
  console.error('FALHOU:', e.message)
  process.exitCode = 1
} finally {
  await browser.close()
  await server.close()
}
