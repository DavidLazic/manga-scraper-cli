require('module-alias/register');

import { DownloadService } from '@services';

DownloadService.all({
  name: 'Test',
  provider: 'Manganelo',
  outDir: 'export'
});
  
  