

import os
import re
import subprocess
import shutil, errno



# Matches a .js file path.
_JS_FILE_REGEX = re.compile(r'^.+\.js$')
 

_ROOTDIR = str(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..','..','..')))
_CLOSURELIB = str(_ROOTDIR +'/lib/closure-library')
_DEPSWRITER = str(_ROOTDIR + 
                      '/lib/closure-library/closure/bin/build/depswriter.py')
_CLOSUREBUILDER = str(_ROOTDIR +
                  '/lib/closure-library/closure/bin/build/closurebuilder.py')

print _ROOTDIR
def ScanTree(root, path_filter=None, ignore_hidden=True):

  def OnError(os_error):
    raise os_error

  
  for dirpath, dirnames, filenames in os.walk(root, onerror=OnError):
    # os.walk allows us to modify dirnames to prevent decent into particular
    # directories.  Avoid hidden directories.

    for dirname in dirnames:
      if ignore_hidden and dirname.startswith('.'):
        dirnames.remove(dirname)

    for filename in filenames:

      # nothing that starts with '.'
      if ignore_hidden and filename.startswith('.'):
        continue

      fullpath = os.path.join(dirpath, filename)

      if path_filter and not path_filter.match(fullpath):
        continue

      yield os.path.normpath(fullpath)


# Fix styles in JS files
for i in ScanTree(str(_ROOTDIR+'/src/pear'),path_filter=_JS_FILE_REGEX):
  subprocess.call(["fixjsstyle", "--strict" ,i])

for i in ScanTree(str(_ROOTDIR+'/src/pear'),path_filter=_JS_FILE_REGEX):
  subprocess.call(["gjslint", "--strict" ,"--custom_jsdoc_tags=example,fires,classdesc,todo","--exclude_files=peardeps.js",i])
