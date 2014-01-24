

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
for i in ScanTree(str(_ROOTDIR+'/src'),path_filter=_JS_FILE_REGEX):
  print (i);
  #subprocess.call(["fixjsstyle", "--strict" ,i])
  #subprocess.call(["gjslint", "--strict" ,i])

# Run depswriter to build dependency tree
f1 = open(_ROOTDIR+"/src/pear/peardeps.js", "w")
subprocess.call(['python',
    _DEPSWRITER,
    '--root_with_prefix','src/pear ../../../../src/pear'],
    stdout=f1)

print '========================================================================'
print 'BUILD PROCESS '
print '========================================================================'

f2 = open(str(_ROOTDIR + '/src/bin/release/pear.grid.js.log'), "w")
subprocess.call(['python',_CLOSUREBUILDER,
                '--namespace=pear.ui.Grid',
                '--root='+str(_CLOSURELIB),
                '--root='+str(_ROOTDIR + '/src/pear'),
                '--compiler_jar='+str(_ROOTDIR + '/src/bin/build/compiler/compiler.jar'),
                '--output_mode=compiled',
                '--compiler_flags=--debug=true' ,
                '--compiler_flags=--process_closure_primitives=true' ,
                '--compiler_flags=--warning_level=VERBOSE',
                '--compiler_flags=--jscomp_warning=uselessCode',
                '--compiler_flags=--jscomp_warning=visibility',
                '--compiler_flags=--jscomp_warning=duplicateMessage',
                '--compiler_flags=--jscomp_warning=es5Strict',
                '--compiler_flags=--jscomp_warning=missingReturn',
                '--compiler_flags=--jscomp_warning=accessControls',
                '--compiler_flags=--jscomp_warning=ambiguousFunctionDecl',
                '--compiler_flags=--jscomp_warning=checkRegExp',
                '--compiler_flags=--jscomp_warning=checkTypes',
                '--compiler_flags=--jscomp_warning=checkVars',
                '--compiler_flags=--jscomp_warning=deprecated',
                '--compiler_flags=--jscomp_warning=fileoverviewTags',
                '--compiler_flags=--jscomp_warning=invalidCasts',
                '--compiler_flags=--jscomp_warning=missingProperties',
                '--compiler_flags=--jscomp_warning=nonStandardJsDocs',
                '--compiler_flags=--jscomp_warning=strictModuleDepCheck',
                '--compiler_flags=--jscomp_warning=undefinedVars',
                '--compiler_flags=--jscomp_warning=unknownDefines',
                '--compiler_flags=--jscomp_warning=missingProvide',
                '--compiler_flags=--jscomp_warning=missingRequire',
                '--compiler_flags=--summary_detail_level=3',
                '--compiler_flags=--compilation_level=WHITESPACE_ONLY',
                '--compiler_flags=--formatting=PRETTY_PRINT',
                '--output_file='+
                    str(_ROOTDIR + '/src/bin/release/pear.grid.js')
                ],stdout=f2)



f3 = open(str(_ROOTDIR + '/src/bin/release/pear.grid.min.js.log'), "w") 
subprocess.call(['python',_CLOSUREBUILDER,
                '--namespace=pear.ui.Grid',
                '--root='+str(_CLOSURELIB),
                '--root='+str(_ROOTDIR + '/src/pear'),
                '--compiler_jar='+str(_ROOTDIR + '/src/bin/build/compiler/compiler.jar'),
                '--output_mode=compiled',
                '--compiler_flags=--process_closure_primitives=true' ,
                '--compiler_flags=--warning_level=VERBOSE',
                '--compiler_flags=--jscomp_warning=uselessCode',
                '--compiler_flags=--jscomp_warning=visibility',
                '--compiler_flags=--jscomp_warning=duplicateMessage',
                '--compiler_flags=--jscomp_warning=es5Strict',
                '--compiler_flags=--jscomp_warning=missingReturn',
                '--compiler_flags=--jscomp_warning=accessControls',
                '--compiler_flags=--jscomp_warning=ambiguousFunctionDecl',
                '--compiler_flags=--jscomp_warning=checkRegExp',
                '--compiler_flags=--jscomp_warning=checkTypes',
                '--compiler_flags=--jscomp_warning=checkVars',
                '--compiler_flags=--jscomp_warning=deprecated',
                '--compiler_flags=--jscomp_warning=fileoverviewTags',
                '--compiler_flags=--jscomp_warning=invalidCasts',
                '--compiler_flags=--jscomp_warning=missingProperties',
                '--compiler_flags=--jscomp_warning=nonStandardJsDocs',
                '--compiler_flags=--jscomp_warning=strictModuleDepCheck',
                '--compiler_flags=--jscomp_warning=undefinedVars',
                '--compiler_flags=--jscomp_warning=unknownDefines',
                '--compiler_flags=--jscomp_warning=missingProvide',
                '--compiler_flags=--jscomp_warning=missingRequire',
                '--compiler_flags=--summary_detail_level=3',
                '--compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS',
                '--compiler_flags=--formatting=PRETTY_PRINT',
                '--output_file='+
                    str(_ROOTDIR + '/src/bin/release/pear.grid.min.js')
                ],stdout=f3)
