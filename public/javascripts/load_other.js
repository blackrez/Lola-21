$(document).ready(function(){
	window.next = 10;

	Linkm = Backbone.Model.extend();

	Collectionlink = Backbone.Collection.extend({
		model: Linkm,
		url: '/page'
	});

	Viewlink = Backbone.View.extend({
		template: _.template(["<p><a href='","<%= url %>","'>","<%= title %>","</a> - proposé par <a href='/author/","<%= author %>","'>","<%= author %>","</a>, le ","<%= date %></p>"].join('')),
		render: function (){
			tmpl = this.template(this.model.toJSON());
			return tmpl
		}
	})

	$(window).scroll(function () {
		if($(window).scrollTop() + $(window).height() == $(document).height()) {
			var $el = $('#next');
			var listView = new infinity.ListView($el);
 			
			var collectionlink = new Collectionlink();
			collectionlink.fetch({success:function(collection){
				var content = $("");
				console.log(collection);
				collection.each(function (model){
					var viewlink = new Viewlink({model:model});
					listView.append($(viewlink.render()));
				})
				listView.append($(content));
			}, data:{page:window.next}});
			window.next = window.next + 10;
			
	}

});
})