async function loadTopSkills(){

    const res = await fetch("http://127.0.0.1:8000/top-skills")
    
    const data = await res.json()
    
    document.getElementById("output").innerHTML = JSON.stringify(data,null,2)
    
    }
    
    async function loadSalaryStats(){
    
    const res = await fetch("http://127.0.0.1:8000/salary-stats")
    
    const data = await res.json()
    
    document.getElementById("output").innerHTML = JSON.stringify(data,null,2)
    
    }