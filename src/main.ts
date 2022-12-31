import { App } from 'aws-cdk-lib';
import { appFactory } from './app-factory';
import { config } from './config';

const app = new App();

const appFactoryProps = config();

appFactoryProps.forEach((props) => {
    appFactory(app, props);
});

app.synth();
