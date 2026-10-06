import type { Lang } from '@/lib/i18n';

type Feature = { icon: string; title: string; text: string; span?: 'wide'; accent: string };
type Step = { icon: string; label: string; text: string };
type Role = { icon: string; role: string; items: string[] };

export interface LandingDict {
  titleBefore: string;
  titleAfter: string;
  subtitle: string;
  ctaStart: string;
  ctaLogin: string;
  stats: [string, string][];
  console: string;
  tests: string[];
  allPassed: string;
  aiTitle: string;
  aiText: string;
  levelTitle: string;
  levelText: string;
  techLabel: string;
  featuresEyebrow: string;
  featuresTitleBefore: string;
  featuresTitleAfter: string;
  features: Feature[];
  miniTests: string[];
  miniStudioHeading: string;
  miniStudioPreview: string;
  pathEyebrow: string;
  pathTitle: string;
  path: Step[];
  rolesEyebrow: string;
  rolesTitle: string;
  roles: Role[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

export const LANDING: Record<Lang, LandingDict> = {
  uk: {
    titleBefore: 'Опануйте',
    titleAfter: 'пишучи справжній код',
    subtitle:
      'Інтерактивна освітня платформа: теорія, квізи та практичні задачі з компіляцією в браузері, автоперевіркою тестів і підказками від штучного інтелекту.',
    ctaStart: 'Почати навчання',
    ctaLogin: 'Увійти',
    stats: [['11', 'модулів'], ['43', 'уроки'], ['3', 'рівні складності']],
    console: 'Консоль · g++ 12.2',
    tests: ['Тест 1 · вхід 5 → 120', 'Тест 2 · вхід 0 → 1', 'Тест 3 · вхід 10 → 3628800'],
    allPassed: 'Усі тести пройдено · 3/3',
    aiTitle: 'AI-підказка',
    aiText: 'Перевір базовий випадок рекурсії: що буде при n = 0?',
    levelTitle: 'Модуль 5 · Рекурсія',
    levelText: 'Рівень: Стандартний',
    techLabel: 'Технології',
    featuresEyebrow: 'Можливості',
    featuresTitleBefore: 'Усе, щоб перейти від',
    featuresTitleAfter: 'до рекурсії',
    features: [
      { icon: 'terminal', title: 'IDE прямо в браузері', text: 'Monaco Editor (як у VS Code) з підсвіткою синтаксису. Код компілюється справжнім GCC 12 і перевіряється автотестами.', span: 'wide', accent: 'blue' },
      { icon: 'auto_awesome', title: 'AI-ментор', text: 'Gemini аналізує помилку і дає підказку — без готової відповіді.', accent: 'violet' },
      { icon: 'stacked_bar_chart', title: '3 рівні складності', text: 'Базовий → Стандартний → Просунутий. Наступний відкривається після проходження.', accent: 'cyan' },
      { icon: 'quiz', title: 'Інтерактивні квізи', text: 'Тести з підказками та миттєвим зворотним зв’язком.', accent: 'pink' },
      { icon: 'shield_lock', title: 'Безпечний вхід', text: 'JWT-сесії, вхід через Google OAuth і відновлення пароля поштою.', accent: 'green' },
      { icon: 'dashboard_customize', title: 'Студія викладача', text: 'Візуальний редактор курсів: теорія в Markdown з живим прев’ю, квізи, практичні задачі з тестами та групи студентів.', span: 'wide', accent: 'amber' },
      { icon: 'monitoring', title: 'Аналітика', text: 'Адмін-панель: користувачі, ролі, курси, відгуки та середній рейтинг.', accent: 'blue' },
    ],
    miniTests: ['Компіляція', 'Тест 1', 'Тест 2', 'Тест 3'],
    miniStudioHeading: 'Цикли',
    miniStudioPreview: 'Живе прев’ю',
    pathEyebrow: 'Як це працює',
    pathTitle: 'Кожен модуль — чотири кроки',
    path: [
      { icon: 'menu_book', label: 'Теорія', text: 'Конспект з прикладами коду та картками' },
      { icon: 'help', label: 'Квіз', text: 'Перевірка розуміння з підказками' },
      { icon: 'code', label: 'Практика', text: 'Задачі з автоперевіркою на 3 рівнях' },
      { icon: 'workspace_premium', label: 'Прогрес', text: 'Статистика, бали та відгуки про курс' },
    ],
    rolesEyebrow: 'Ролі',
    rolesTitle: 'Одна платформа — три робочі простори',
    roles: [
      { icon: 'school', role: 'Студент', items: ['Проходить модулі та рівні', 'Пише й запускає C++ код', 'Отримує AI-підказки', 'Бачить свій прогрес'] },
      { icon: 'edit_note', role: 'Викладач', items: ['Створює курси та модулі', 'Пише теорію з прев’ю', 'Налаштовує тести до задач', 'Керує групами студентів'] },
      { icon: 'admin_panel_settings', role: 'Адміністратор', items: ['Керує користувачами й ролями', 'Модерує курси', 'Переглядає відгуки', 'Бачить аналітику платформи'] },
    ],
    ctaTitle: 'Готові написати свій перший',
    ctaText: 'Реєстрація займає хвилину — через email або Google.',
    ctaButton: 'Створити акаунт',
  },
  en: {
    titleBefore: 'Master',
    titleAfter: 'by writing real\u00A0code',
    subtitle:
      'An interactive learning platform: theory, quizzes and coding tasks with in-browser compilation, automated tests and AI-powered hints.',
    ctaStart: 'Start learning',
    ctaLogin: 'Log in',
    stats: [['11', 'modules'], ['43', 'lessons'], ['3', 'difficulty levels']],
    console: 'Console · g++ 12.2',
    tests: ['Test 1 · input 5 → 120', 'Test 2 · input 0 → 1', 'Test 3 · input 10 → 3628800'],
    allPassed: 'All tests passed · 3/3',
    aiTitle: 'AI hint',
    aiText: 'Check the recursion base case: what happens when n = 0?',
    levelTitle: 'Module 5 · Recursion',
    levelText: 'Level: Standard',
    techLabel: 'Technologies',
    featuresEyebrow: 'Features',
    featuresTitleBefore: 'Everything you need to go from',
    featuresTitleAfter: 'to recursion',
    features: [
      { icon: 'terminal', title: 'IDE in the browser', text: 'Monaco Editor (the one behind VS Code) with syntax highlighting. Code is compiled by real GCC 12 and checked by automated tests.', span: 'wide', accent: 'blue' },
      { icon: 'auto_awesome', title: 'AI mentor', text: 'Gemini analyses the error and gives a hint — never the full answer.', accent: 'violet' },
      { icon: 'stacked_bar_chart', title: '3 difficulty levels', text: 'Basic → Standard → Advanced. The next level unlocks once you pass the current one.', accent: 'cyan' },
      { icon: 'quiz', title: 'Interactive quizzes', text: 'Questions with hints and instant feedback.', accent: 'pink' },
      { icon: 'shield_lock', title: 'Secure sign-in', text: 'JWT sessions, Google OAuth and password recovery by email.', accent: 'green' },
      { icon: 'dashboard_customize', title: 'Teacher studio', text: 'A visual course editor: Markdown theory with live preview, quizzes, coding tasks with tests, and student groups.', span: 'wide', accent: 'amber' },
      { icon: 'monitoring', title: 'Analytics', text: 'Admin panel: users, roles, courses, reviews and average rating.', accent: 'blue' },
    ],
    miniTests: ['Compilation', 'Test 1', 'Test 2', 'Test 3'],
    miniStudioHeading: 'Loops',
    miniStudioPreview: 'Live preview',
    pathEyebrow: 'How it works',
    pathTitle: 'Every module — four steps',
    path: [
      { icon: 'menu_book', label: 'Theory', text: 'Notes with code examples and cards' },
      { icon: 'help', label: 'Quiz', text: 'Check your understanding with hints' },
      { icon: 'code', label: 'Practice', text: 'Auto-graded tasks on 3 levels' },
      { icon: 'workspace_premium', label: 'Progress', text: 'Stats, scores and course reviews' },
    ],
    rolesEyebrow: 'Roles',
    rolesTitle: 'One platform — three workspaces',
    roles: [
      { icon: 'school', role: 'Student', items: ['Completes modules and levels', 'Writes and runs C++ code', 'Gets AI hints', 'Tracks their progress'] },
      { icon: 'edit_note', role: 'Teacher', items: ['Creates courses and modules', 'Writes theory with live preview', 'Sets up tests for tasks', 'Manages student groups'] },
      { icon: 'admin_panel_settings', role: 'Administrator', items: ['Manages users and roles', 'Moderates courses', 'Reviews feedback', 'Sees platform analytics'] },
    ],
    ctaTitle: 'Ready to write your first',
    ctaText: 'Sign-up takes a minute — with email or Google.',
    ctaButton: 'Create account',
  },
};
