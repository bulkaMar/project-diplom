'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { LANDING } from './landing.i18n';
import { useLang } from '@/lib/i18n';

// ---- Code typed into the hero editor, token by token ----
type Tok = [string, string]; // [className, text]
const CODE: Tok[][] = [
  [['kw', '#include'], ['', ' '], ['str', '<iostream>']],
  [['kw', 'using namespace'], ['', ' std;']],
  [],
  [['ty', 'int'], ['', ' '], ['fn', 'factorial'], ['', '('], ['ty', 'int'], ['', ' n) {']],
  [['', '    '], ['kw', 'return'], ['', ' n <= '], ['num', '1'], ['', ' ? '], ['num', '1'], ['', ' : n * '], ['fn', 'factorial'], ['', '(n - '], ['num', '1'], ['', ');']],
  [['', '}']],
  [],
  [['ty', 'int'], ['', ' '], ['fn', 'main'], ['', '() {']],
  [['', '    '], ['ty', 'int'], ['', ' n; cin >> n;']],
  [['', '    cout << '], ['fn', 'factorial'], ['', '(n) << endl;']],
  [['', '    '], ['kw', 'return'], ['', ' '], ['num', '0'], ['', ';']],
  [['', '}']],
];
// Character offset where each token / line begins (each line ends with a newline)
const TOKEN_STARTS: number[][] = [];
const LINE_STARTS: number[] = [];
let offset = 0;
for (const line of CODE) {
  LINE_STARTS.push(offset);
  TOKEN_STARTS.push(line.map(([, t]) => (offset += t.length) - t.length));
  offset += 1;
}
const TOTAL_CHARS = offset;

function TypedCode() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= TOTAL_CHARS) return;
    const id = setTimeout(() => setCount((c) => Math.min(c + 2, TOTAL_CHARS)), 18);
    return () => clearTimeout(id);
  }, [count]);

  return (
    <pre className={styles.code}>
      {CODE.map((line, i) => {
        const lineStart = LINE_STARTS[i];
        const lineEnd = lineStart + line.reduce((n, [, t]) => n + t.length, 0);
        const parts = line.map(([cls, text], j) => {
          const shown = text.slice(0, Math.max(0, count - TOKEN_STARTS[i][j]));
          return shown ? <span key={j} className={cls ? styles[cls] : undefined}>{shown}</span> : null;
        });
        const typing = count > lineStart && count <= lineEnd + 1 && count < TOTAL_CHARS;
        return (
          <div key={i} className={styles.codeLine} style={{ opacity: count > lineStart ? 1 : 0 }}>
            <span className={styles.lineNo}>{i + 1}</span>
            <span>{parts}</span>
            {typing && <span className={styles.caret} />}
          </div>
        );
      })}
    </pre>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

const TECH = ['Next.js 16', 'React 19', 'NestJS', 'PostgreSQL', 'Prisma ORM', 'Monaco Editor', 'Google Gemini', 'Godbolt API', 'Docker', 'JWT · OAuth 2.0', 'Framer Motion', 'Material UI'];

export default function Home() {
  const lang = useLang((st) => st.lang);
  const t = LANDING[lang];

  return (
    <div className={styles.page}>
      {/* ---------- Ambient background ---------- */}
      <div className={styles.aurora} aria-hidden>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
        <div className={styles.blobC} />
      </div>
      <div className={styles.grid} aria-hidden />

      {/* ---------- HERO ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className={styles.title}>
            {t.titleBefore} <span className={styles.gradient}>C++</span>
            <br />
            {t.titleAfter}
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className={styles.subtitle}>
            {t.subtitle}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className={styles.ctaRow}>
            <Link href="/register" className={styles.btnPrimary}>
              {t.ctaStart}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link href="/login" className={styles.btnGhost}>
              {t.ctaLogin}
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className={styles.heroStats}>
            {t.stats.map(([v, l]) => (
              <div key={l} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{v}</span>
                <span className={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---- Editor mockup ---- */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, y: 40, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.windowGlow} />
          <div className={styles.window}>
            <div className={styles.windowBar}>
              <span className={styles.dotR} />
              <span className={styles.dotY} />
              <span className={styles.dotG} />
              <span className={styles.tab}>
                <span className="material-symbols-outlined">code</span>
                solution.cpp
              </span>
              <span className={styles.runBtn}>
                <span className="material-symbols-outlined">play_arrow</span>
                Run
              </span>
            </div>
            <TypedCode />
            <div className={styles.console}>
              <div className={styles.consoleHead}>{t.console}</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6 }}
                className={styles.consoleBody}
              >
                {t.tests.map((line) => (
                  <div key={line}><span className={styles.ok}>✓</span> {line}</div>
                ))}
                <div className={styles.passed}>{t.allPassed}</div>
              </motion.div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            className={`${styles.float} ${styles.floatAi}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className={styles.floatIcon}>
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <div className={styles.floatTitle}>{t.aiTitle}</div>
              <div className={styles.floatText}>{t.aiText}</div>
            </div>
          </motion.div>
          <motion.div
            className={`${styles.float} ${styles.floatLevel}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <div className={styles.ring}>
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" className={styles.ringBg} />
                <circle cx="18" cy="18" r="15.9" className={styles.ringFg} />
              </svg>
              <span>72%</span>
            </div>
            <div>
              <div className={styles.floatTitle}>{t.levelTitle}</div>
              <div className={styles.floatText}>{t.levelText}</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Tech marquee ---------- */}
      <section className={styles.marquee} aria-label={t.techLabel}>
        <div className={styles.marqueeTrack}>
          {[...TECH, ...TECH].map((t, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeDot} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className={styles.section}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={styles.sectionHead}>
          <span className={styles.eyebrow}>{t.featuresEyebrow}</span>
          <h2 className={styles.h2}>
            {t.featuresTitleBefore} <span className={styles.gradient}>Hello, World</span> {t.featuresTitleAfter}
          </h2>
        </motion.div>

        <div className={styles.bento}>
          {t.features.map((f, i) => (
            <motion.article
              key={f.icon}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
              className={`${styles.card} ${f.span === 'wide' ? styles.cardWide : ''} ${styles['accent_' + f.accent]}`}
            >
              <div className={styles.cardIcon}>
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardText}>{f.text}</p>
              {f.icon === 'terminal' && (
                <div className={styles.miniTests}>
                  {t.miniTests.map((label) => (
                    <span key={label} className={styles.miniTest}>✓ {label}</span>
                  ))}
                </div>
              )}
              {f.icon === 'dashboard_customize' && (
                <div className={styles.miniStudio}>
                  <div className={styles.miniPane}><b>## {t.miniStudioHeading}</b><span>for (int i = 0; …)</span></div>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  <div className={`${styles.miniPane} ${styles.miniPreview}`}><b>{t.miniStudioHeading}</b><span>{t.miniStudioPreview}</span></div>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- Learning path ---------- */}
      <section className={styles.section}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={styles.sectionHead}>
          <span className={styles.eyebrow}>{t.pathEyebrow}</span>
          <h2 className={styles.h2}>{t.pathTitle}</h2>
        </motion.div>
        <div className={styles.path}>
          {t.path.map((p, i) => (
            <motion.div
              key={p.icon}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className={styles.step}
            >
              <div className={styles.stepNum}>0{i + 1}</div>
              <div className={styles.stepIcon}>
                <span className="material-symbols-outlined">{p.icon}</span>
              </div>
              <h3 className={styles.stepTitle}>{p.label}</h3>
              <p className={styles.stepText}>{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Roles ---------- */}
      <section className={styles.section}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={styles.sectionHead}>
          <span className={styles.eyebrow}>{t.rolesEyebrow}</span>
          <h2 className={styles.h2}>{t.rolesTitle}</h2>
        </motion.div>
        <div className={styles.roles}>
          {t.roles.map((r, i) => (
            <motion.div
              key={r.icon}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className={styles.role}
            >
              <div className={styles.roleHead}>
                <div className={styles.roleIcon}>
                  <span className="material-symbols-outlined">{r.icon}</span>
                </div>
                <h3>{r.role}</h3>
              </div>
              <ul>
                {r.items.map((it) => (
                  <li key={it}>
                    <span className="material-symbols-outlined">check</span>
                    {it}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.section}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={styles.cta}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>{t.ctaTitle} <span className={styles.mono}>main()</span>?</h2>
          <p className={styles.ctaText}>{t.ctaText}</p>
          <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
            <Link href="/register" className={styles.btnPrimary}>
              {t.ctaButton}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
