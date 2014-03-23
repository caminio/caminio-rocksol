 module.exports = function( caminio ) {

  return {
    run: function( options, next ){
      console.log('in the run fusadfsdafasdfnction');
      next( true );
    }
  };

};
