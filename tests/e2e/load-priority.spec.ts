import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import { ConfigService } from '../../lib';
import { AppModule } from '../src/app.module';

describe('Environment variables and .env files', () => {
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;
  beforeAll(() => {
    envBackup = process.env;
  });
  describe('without conflicts', () => {
    beforeAll(async () => {
      process.env['NAME'] = 'TEST';
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule.withEnvVars()],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
    });

    it(`should return loaded env variables from vars and dotenv`, () => {
      const configService = app.get(ConfigService);
      expect(configService.get('PORT')).toEqual('4000');
      expect(configService.get('NAME')).toEqual('TEST');
    });
  });

  describe('with conflicts', () => {
    beforeAll(async () => {
      process.env['PORT'] = '8000';
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule.withEnvVars()],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
    });

    it('should choose env vars over dotenv', () => {
      const configService = app.get(ConfigService);
      expect(configService.get('PORT')).toEqual('8000');
    });
  });

  describe('with conflicts and schema validation', () => {
    beforeAll(async () => {
      process.env['PORT'] = '8000';
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.withSchemaValidation(join(__dirname, '.env.valid')),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
    });

    it('should choose env vars over dotenv', () => {
      const configService = app.get(ConfigService);
      expect(configService.get('PORT')).toEqual(8000);
    });
  });

  afterEach(async () => {
    process.env = envBackup;
    await app.close();
  });
});
