import { awscdk } from 'projen';

const name = 'cdk-ssm-deployer';

const project = new awscdk.AwsCdkTypeScriptApp({
  defaultReleaseBranch: 'main',
  cdkVersion: '2.8.0',
  name,
  packageName: name.toLowerCase().replace(/\./g, '-'),
  licensed: false,
  projenrcTs: true,
  eslint: false,
  deps: ['aws-lambda'],
  devDeps: ['esbuild@0', '@types/aws-lambda'],
  githubOptions: {
    workflows: false,
    mergify: false,
  },
  gitignore: ['.idea'],
  context: {
    params: {
      destinations: ['h6060-001'],
    },
  },
});
project.synth();
