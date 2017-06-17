require 'nokogiri'


def minifyJs(indexFile)
	scriptSrcs = indexFile.css('script').map do |scriptTag|
		scriptTag['src']
	end
	fileNameScript =  scriptSrcs.map { |script|  "public_html/#{script}" }.join(" ")
	commandString = "cat #{fileNameScript} > app.js"
	puts commandString

	`#{commandString}`
	`uglifyjs app.js > app.min.js`
end

def rewriteHTML(indexFile)
	jsAppFilename = 'js/app.min.js'
	indexFile.css('script').each_with_index do |scriptTag, i|
		if i == 0
			scriptTag['src'] = jsAppFilename
		else
			scriptTag.remove
		end
	end
	indexFile.css('link[rel="stylesheet"]')[1].remove
	puts indexFile
end

def minifyCSS()
	`cat public_html/stylesheets/lib/bootstrap-buttons.css public_html/stylesheets/style.css > style.scss`
	`sassc --style compressed style.scss style.css`
end

indexFile = Nokogiri::HTML(File.open("public_html/index.html")) do |config|
  config.noblanks
end



# minifyJs indexFile
rewriteHTML indexFile
# minifyCSS

