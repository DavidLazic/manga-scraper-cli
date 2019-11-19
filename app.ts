require('module-alias/register');

import { DownloadService } from '@services';

DownloadService.latest({
  name: 'Test',
  provider: 'Manganelo',
  outDir: 'export'
});
  
  