import { App } from 'aws-cdk-lib';
import { appFactory } from '../src/app-factory';
import { config } from '../src/config';

describe('AppFactory snapshot tests', () => {
    const appFactoryProps = config();
    appFactoryProps.forEach((props) => {
        const app = new App();
        appFactory(app, props);
        const { stacks } = app.synth();
        stacks.forEach(({ template, stackName }) => {
            test(stackName, () => {
                expect(template).toMatchSnapshot();
            });
        });
    });
});
