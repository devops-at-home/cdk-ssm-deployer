import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SSMDeployment } from '../src/constructs/ssm-deployment';

describe('SSMDeployment', () => {
  const stack = new Stack();
  new SSMDeployment(stack, 'SSMDeployment', {
    bucketName: 'someName',
    destination: 'h6060-001',
  });

  const template = Template.fromStack(stack);

  test('Snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
