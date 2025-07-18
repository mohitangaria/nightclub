import Hapi from "@hapi/hapi";
import * as Common from "./common"

const status=async(request:Hapi.RequestQuery,h:Hapi.ResponseToolkit)=>{
    try{
        return h.response({message:request.i18n.__("SERVER_RUNNING")}).code(200)
    }catch(err:unknown){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}
export {
    status
}