import { awscdk } from 'projen';

const name = 'cdk-ssm-deployer';

const project = new awscdk.AwsCdkTypeScriptApp({
  defaultReleaseBranch: 'main',
  cdkVersion: '2.51.1',
  name,
  packageName: name.toLowerCase().replace(/\./g, '-'),
  licensed: false,
  projenrcTs: true,
  eslint: false,
  deps: ['aws-lambda'],
  devDeps: ['esbuild@0', '@types/aws-lambda', '@types/node'],
  gitignore: ['.idea'],
});
project.synth();
