import sys
import base64
import textwrap


for name in sys.argv[1:]:
    with open(name, 'rb') as r:
        with open(name + '.js', 'w') as w:
            encoded = base64.b64encode(r.read())
            lines = textwrap.wrap(encoded.decode('ascii'))
            concat = '\\\n'.join(lines)
            w.write("export default '{}';".format(concat))

