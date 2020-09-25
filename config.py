from application import current_settings


if current_settings == 'local':
    from settings.local import *
else:
    from settings.production import *

import routes
