import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData()
        const file = form.get('file')
        if (!(file instanceof Blob)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { text } = await pdf(buffer)
        return NextResponse.json({ text })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
