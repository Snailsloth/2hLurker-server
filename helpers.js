//test if one of params is cyrillic. encode if so

const cyrillicEncode = (string) => {
	if(/[а-яА-ЯЁё]/.test(string)){
		return	encodeURIComponent(string)
	} else {
		return string;
	}
};


// const getEmployerLogo(link){
	
// }



exports.cyrillicEncode = cyrillicEncode;