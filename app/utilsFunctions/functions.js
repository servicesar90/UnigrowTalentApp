const handlestring =(string, length, showFull)=>{
    let cutString = string;
    if(string?.length > length){
         cutString = `${string.slice(0,length)}...`;
    }
    if(showFull){
        return string;
    }else{

        return cutString;
    }
}

export default handlestring;

