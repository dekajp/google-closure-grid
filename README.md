#google-closure-grid (pear.ui.Grid)

version 0.1

* Demo : http://dekajp.github.io/demos/index.html
* API  : http://dekajp.github.io/docs/ 
* Grid : http://dekajp.github.io/docs/pear.ui.html#Grid

##Features

* Row Virtualization ~ 100,000 Rows
* Active Cell and Active Row Highlight
* Sorting
* Column Move & Resizing
* Header Cell Menu
* Paging
* Column Formatting
* Keyboard Navigation
* Data Filter
* Column Move
* Sticky Footer / Aggregates
* Customizable Cell Editors
* Subgrids / Hierarchial Records
* Column Renderer ( For Column Templating)
* ... more coming (please feel free to raise feature [request](https://github.com/dekajp/google-closure-grid/issues) in Github)

##Credits 
* pear.ui.Grid borrows concepts and inspiration from [Slickgrid](https://github.com/mleibman/SlickGrid)
* [Google-Closure-Library](https://code.google.com/p/closure-library/)

## More on Row Virtualization
Row virtualization -  referring to the concept where the rows 
of the table/ul/div are not visible or rendered at all as long as they are 
not scrolled into the view. Basically, the point is to eliminate rendering 
if the item is never shown (behind a scroll). 
Source Stackoverflow : http://goo.gl/rYsY88
more discussion on this thread - http://goo.gl/3hlK6z

##License
MIT-License


##Build
* gjslint and fixjsstyle [more](https://developers.google.com/closure/utilities/docs/linter_howto)

* $/python src/bin/build/pearbuildlint.py
* $/python src/bin/build/build.py

