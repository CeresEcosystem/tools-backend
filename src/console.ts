import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

const nestConsole = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
});

nestConsole.init().then(async (app) => {
  try {
    await app.init();
    await nestConsole.boot();
    await app.close();

    process.exit(0);
  } catch (e) {
    console.log(e);
    await app.close();

    process.exit(1);
  }
});
