const { STAGE_TEMPLATES, toGitHubActions, toGitLabCI, toJenkinsfile, setStages } = require('../app');

describe('CI/CD Visualizer', () => {
  test('toGitHubActions generates valid YAML', () => {
    setStages([{ ...STAGE_TEMPLATES.build, type: 'build', id: 1 }]);
    const yaml = toGitHubActions();
    expect(yaml).toContain('name: CI/CD Pipeline');
    expect(yaml).toContain('runs-on: ubuntu-latest');
    expect(yaml).toContain('npm run build');
  });

  test('toGitLabCI generates valid YAML', () => {
    setStages([{ ...STAGE_TEMPLATES.test, type: 'test', id: 2 }]);
    const yaml = toGitLabCI();
    expect(yaml).toContain('stages:');
    expect(yaml).toContain('script:');
    expect(yaml).toContain('npm test');
  });

  test('toJenkinsfile generates valid Groovy', () => {
    setStages([{ ...STAGE_TEMPLATES.deploy, type: 'deploy', id: 3 }]);
    const groovy = toJenkinsfile();
    expect(groovy).toContain('pipeline {');
    expect(groovy).toContain("stage('Deploy')");
  });
});
