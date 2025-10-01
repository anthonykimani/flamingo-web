import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const CreateQuiz = () => {
    return (
        <div className="flex flex-col h-1/2 justify-around items-center">
            <Input className='' variant={"title"} />
            <Button variant={"active"} size={"gametype"}>Degen PvP</Button>
        </div>
    )
}

export default CreateQuiz