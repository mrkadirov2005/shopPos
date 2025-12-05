import { JWTKEYS } from "../config/JWT_keys.js"
import {client} from "./../config/dbcon.js";

export const getShops = (req, res) => {
    
    const sk=JWTKEYS.CTO;
   
    
    const secret_key=req.headers["secret_key"];
    if(!secret_key){
        return res.status(400).json({message:"Missing fields"});
    }
    if(secret_key!==sk){
        return res.status(401).json({message:"Unauthorized access"});
    }
// fetch all shops and return
    client.query("SELECT * FROM shop_name",(err,result)=>{
        if(err){
            console.error("Error fetching shops:",err);
            return res.status(500).json({message:"Server Error"});
        }
        return  res.status(200).json({shops:result.rows});
    })


    }