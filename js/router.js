/* js/router.js — Hash роутер SPA */

const Router = (() => {
  const routes = {
    'home':      () => HomePage.render(),
    'lessons':   () => LessonsPage.render(),
    'lesson':    (id) => LessonDetailPage.render(id),
    'practice':  () => PracticePage.render(),
    'quizzes':   () => QuizzesPage.render(),
    'quiz':      (id) => QuizzesPage.renderQuiz(id),
    'projects':  () => ProjectsPage.render(),
    'dashboard': () => DashboardPage.render(),
  };

  function navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const [page, param] = hash.split('/');
    const handler = routes[page] || routes['home'];
    handler(param);
    window.scrollTo(0, 0);
  }

  function init() {
    window.addEventListener('hashchange', navigate);
    navigate();
  }

  function go(path) {
    window.location.hash = path;
  }

  return { init, go, navigate };
})();
